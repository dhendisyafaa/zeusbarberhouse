import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api/auth';
import { validationError } from '@/lib/api/errors';
import { handleError, ok } from '@/lib/api/response';
import { db } from '@/src/prisma/db';

const CHART_COLORS = ['#0033A0', '#b6c4ff', '#FF2A2A', '#444653', '#FAFAFA'];

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const rawBranchId = request.nextUrl.searchParams.get('branchId');
    let branchId: string | undefined;
    if (rawBranchId && rawBranchId !== 'all') {
      const parsed = z.string().uuid().safeParse(rawBranchId);
      if (!parsed.success) throw validationError('branchId tidak valid');
      branchId = parsed.data;
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const bookingsQuery = db.orm.public.Booking
      .where({ status: 'COMPLETED' })
      .where((booking) => booking.startsAt.gte(since));
    const bookings = await (branchId
      ? bookingsQuery.where({ branchId })
      : bookingsQuery)
      .include('items', (items) =>
        items.select('serviceId', 'serviceNameSnapshot', 'unitPriceRupiahSnapshot'),
      )
      .all();
    const items = bookings.flatMap((booking) => booking.items);

    const totals = new Map<string, {
      id: string;
      name: string;
      priceRupiah: number;
      orderCount: number;
    }>();

    for (const item of items) {
      const current = totals.get(item.serviceId) ?? {
        id: item.serviceId,
        name: item.serviceNameSnapshot,
        priceRupiah: item.unitPriceRupiahSnapshot,
        orderCount: 0,
      };
      current.orderCount += 1;
      totals.set(item.serviceId, current);
    }

    const totalOrders = items.length;
    const distribution = Array.from(totals.values())
      .sort((left, right) => right.orderCount - left.orderCount)
      .map((service, index) => ({
        ...service,
        percentage: totalOrders ? Math.round((service.orderCount / totalOrders) * 100) : 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));

    return ok({ totalOrders, services: distribution, distribution });
  } catch (error) {
    return handleError(error);
  }
}
