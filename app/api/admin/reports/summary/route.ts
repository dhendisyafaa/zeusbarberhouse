import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api/auth';
import { validationError } from '@/lib/api/errors';
import { handleError, ok } from '@/lib/api/response';
import { db } from '@/src/prisma/db';
import { expireDueMemberships } from '@/lib/services/customer-account.service';

const branchIdSchema = z.string().uuid();
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function getJakartaDayStart(date: Date) {
  const localDate = new Date(date.getTime() + JAKARTA_OFFSET_MS);
  localDate.setUTCHours(0, 0, 0, 0);
  return new Date(localDate.getTime() - JAKARTA_OFFSET_MS);
}

function formatDay(date: Date) {
  return date.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
    day: '2-digit',
  }).toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await expireDueMemberships();
    const rawBranchId = request.nextUrl.searchParams.get('branchId');
    const branchId = rawBranchId && rawBranchId !== 'all'
      ? branchIdSchema.parse(rawBranchId)
      : undefined;
    const now = new Date();
    const todayStart = getJakartaDayStart(now);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);

    const todayBookingsQuery = db.orm.public.Booking
      .where((booking) => booking.startsAt.gte(todayStart))
      .where((booking) => booking.startsAt.lt(tomorrowStart))
      .where((booking) => branchId ? booking.branchId.eq(branchId) : booking.id.isNotNull());
    const weekBookingsQuery = db.orm.public.Booking
      .where((booking) => booking.startsAt.gte(weekStart))
      .where((booking) => booking.startsAt.lt(tomorrowStart))
      .where((booking) => branchId ? booking.branchId.eq(branchId) : booking.id.isNotNull());
    const yesterdayBookingsQuery = db.orm.public.Booking
      .where((booking) => booking.startsAt.gte(yesterdayStart))
      .where((booking) => booking.startsAt.lt(todayStart))
      .where((booking) => branchId ? booking.branchId.eq(branchId) : booking.id.isNotNull());
    const barbersQuery = branchId
      ? db.orm.public.Barber.where({ branchId })
      : db.orm.public.Barber;

    const [todayBookings, yesterdayBookingCount, weekBookings, activeMembers, activeBarbers, totalBarbers, pointsToday] = await Promise.all([
      todayBookingsQuery
        .select('status')
        .include('transaction', (transaction) =>
          transaction.select('status', 'totalAmountRupiah'),
        )
        .all(),
      yesterdayBookingsQuery.aggregate((aggregate) => ({ total: aggregate.count() })),
      weekBookingsQuery
        .select('startsAt', 'status')
        .include('transaction', (transaction) =>
          transaction.select('status', 'totalAmountRupiah'),
        )
        .all(),
      db.orm.public.Membership
        .where({ status: 'ACTIVE' })
        .aggregate((aggregate) => ({ total: aggregate.count() })),
      barbersQuery
        .where((barber) => barber.isActive.eq(true))
        .aggregate((aggregate) => ({ total: aggregate.count() })),
      barbersQuery.aggregate((aggregate) => ({ total: aggregate.count() })),
      db.orm.public.MembershipPointTransaction
        .where((entry) => entry.createdAt.gte(todayStart))
        .where((entry) => entry.createdAt.lt(tomorrowStart))
        .select('deltaPoints')
        .all(),
    ]);

    const queueCount = todayBookings.filter((booking) =>
      booking.status === 'AWAITING_CONFIRMATION' ||
      (booking.status === 'PENDING_PAYMENT' && booking.transaction?.status === 'PENDING'),
    ).length;
    const revenueToday = todayBookings.reduce((sum, booking) => {
      if (booking.transaction?.status !== 'PAID') return sum;
      return sum + booking.transaction.totalAmountRupiah;
    }, 0);

    const weeklyTrends = Array.from({ length: 7 }, (_, index) => {
      const dayStart = new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayBookings = weekBookings.filter(
        (booking) => booking.startsAt >= dayStart && booking.startsAt < dayEnd,
      );
      const revenue = dayBookings.reduce((sum, booking) => {
        return booking.transaction?.status === 'PAID'
          ? sum + booking.transaction.totalAmountRupiah
          : sum;
      }, 0);

      return {
        day: formatDay(dayStart),
        revenue,
        bookings: dayBookings.length,
      };
    });

    const completedCount = todayBookings.filter((booking) => booking.status === 'COMPLETED').length;
    const inProgressCount = todayBookings.filter((booking) => booking.status === 'CONFIRMED').length;
    const growthPercentage = yesterdayBookingCount.total
      ? Math.round(((todayBookings.length - yesterdayBookingCount.total) / yesterdayBookingCount.total) * 100)
      : todayBookings.length > 0 ? 100 : 0;
    const revenueTarget = 4_000_000;

    return ok({
      metrics: {
        totalBookingsToday: todayBookings.length,
        growthPercentage,
        completedCount,
        inProgressCount,
        queueCount,
        revenueToday,
        revenueTarget,
        targetAchievedPercent: Math.min(100, Math.round((revenueToday / revenueTarget) * 1000) / 10),
        chairUtilizationPercent: activeBarbers.total
          ? Math.round((inProgressCount / activeBarbers.total) * 1000) / 10
          : 0,
        activeChairs: inProgressCount,
        totalChairs: totalBarbers.total,
        vipVisitsToday: 0,
        pointsIssuedToday: pointsToday.reduce(
          (sum, entry) => sum + Math.max(0, entry.deltaPoints),
          0,
        ),
        totalActiveMembers: activeMembers.total,
        softLockAlertCount: todayBookings.filter((booking) =>
          booking.status === 'AWAITING_CONFIRMATION',
        ).length,
      },
      weeklyTrends,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleError(validationError('branchId tidak valid'));
    }
    return handleError(error);
  }
}
