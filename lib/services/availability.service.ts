import { and } from '@prisma/orm-postgres/orm-client';
import { db } from '@/src/prisma/db';

const SLOT_INTERVAL_MINUTES = 30;

function dayStartInBandung(date: string) {
  return new Date(`${date}T00:00:00.000+07:00`);
}

export async function getAvailableTimeSlots({
  branchId,
  barberId,
  date,
  durationMinutes,
}: {
  branchId: string;
  barberId: string;
  date: string;
  durationMinutes: number;
}) {
  const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  const dayStart = dayStartInBandung(date);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const [branch, barber, branchSchedule, barberSchedule, timeOff, bookings] =
    await Promise.all([
      db.orm.public.Branch.first({ id: branchId, isActive: true }),
      db.orm.public.Barber.first({ id: barberId, branchId, isActive: true }),
      db.orm.public.BranchSchedule.first({ branchId, dayOfWeek }),
      db.orm.public.BarberSchedule.first({ barberId, dayOfWeek }),
      db.orm.public.BarberTimeOff
        .where({ barberId })
        .where((time) => time.startsAt.lt(dayEnd))
        .where((time) => time.endsAt.gt(dayStart))
        .all(),
      db.orm.public.Booking
        .where({ barberId })
        .where((booking) => and(
          booking.startsAt.lt(dayEnd),
          booking.endsAt.gt(dayStart),
        ))
        .select('startsAt', 'endsAt', 'status', 'holdExpiresAt')
        .all(),
    ]);

  if (!branch || !barber || !branchSchedule || !barberSchedule) return [];

  const openMinute = Math.max(branchSchedule.openMinute, barberSchedule.startMinute);
  const closeMinute = Math.min(branchSchedule.closeMinute, barberSchedule.endMinute);
  const now = new Date();
  const slots: string[] = [];

  for (
    let minute = Math.ceil(openMinute / SLOT_INTERVAL_MINUTES) * SLOT_INTERVAL_MINUTES;
    minute + durationMinutes <= closeMinute;
    minute += SLOT_INTERVAL_MINUTES
  ) {
    const slotStart = new Date(dayStart.getTime() + minute * 60 * 1000);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
    if (slotStart <= now) continue;

    const inBreak = barberSchedule.breakStartMinute !== null &&
      barberSchedule.breakEndMinute !== null &&
      minute < barberSchedule.breakEndMinute &&
      minute + durationMinutes > barberSchedule.breakStartMinute;
    if (inBreak) continue;

    const onTimeOff = timeOff.some((period) =>
      period.startsAt < slotEnd && period.endsAt > slotStart,
    );
    if (onTimeOff) continue;

    const booked = bookings.some((booking) => {
      const active = booking.status === 'AWAITING_CONFIRMATION' ||
        booking.status === 'CONFIRMED' ||
        (booking.status === 'PENDING_PAYMENT' &&
          booking.holdExpiresAt !== null &&
          booking.holdExpiresAt.getTime() > now.getTime());
      return active && booking.startsAt < slotEnd && booking.endsAt > slotStart;
    });
    if (!booked) {
      const localMinute = minute % (24 * 60);
      const hour = String(Math.floor(localMinute / 60)).padStart(2, '0');
      const minutes = String(localMinute % 60).padStart(2, '0');
      slots.push(`${hour}:${minutes}`);
    }
  }

  return slots;
}

export function getBandungDateTimeParts(date: Date) {
  const localDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
}
