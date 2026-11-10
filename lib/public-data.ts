import { db } from '@/src/prisma/db';
import { attachBarberPhotoUrls } from '@/lib/supabase/barber-photos';
import {
  createHaircutImageSignedUrl,
  getHaircutImageStorage,
} from '@/lib/supabase/haircut-images';

function formatMinute(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}

export async function getHomePageData() {
  const [services, branches, barbers, membershipPolicy] = await Promise.all([
    db.orm.public.Service
      .where({ isActive: true })
      .orderBy([(service) => service.sortOrder.asc(), (service) => service.name.asc()])
      .select('id', 'name', 'description', 'priceRupiah', 'durationMinutes')
      .all(),
    db.orm.public.Branch
      .where({ isActive: true })
      .include('schedules')
      .orderBy((branch) => branch.name.asc())
      .all(),
    getPublicBarbers(),
    db.orm.public.MembershipPointPolicy
      .select('pointsPerCompletedBooking')
      .first({ id: 'default' }),
  ]);

  return {
    services,
    branches: branches.map((branch) => ({
      id: branch.id,
      slug: branch.slug,
      name: branch.name,
      address: branch.address,
      city: branch.city,
      phone: branch.phone,
      mapsUrl: branch.mapsUrl,
      schedules: branch.schedules.map((schedule) => ({
        dayOfWeek: schedule.dayOfWeek,
        open: formatMinute(schedule.openMinute),
        close: formatMinute(schedule.closeMinute),
      })),
    })),
    barbers: barbers.map((barber) => ({
      id: barber.id,
      name: barber.name,
      bio: barber.bio,
      photoUrl: barber.photoUrl,
      branchId: barber.branchId,
      branchName: barber.branch.name,
    })),
    barberCount: barbers.length,
    pointsPerCompletedBooking: membershipPolicy?.pointsPerCompletedBooking ?? 0,
  };
}

export async function getPublicBarbers(branchId?: string | null) {
  const barbers = await db.orm.public.Barber
    .where({ isActive: true, ...(branchId ? { branchId } : {}) })
    .include('branch', (branch) => branch.select('id', 'name', 'slug'))
    .include('schedules')
    .orderBy((barber) => barber.name.asc())
    .all();

  const withPhotos = await attachBarberPhotoUrls(barbers);
  return withPhotos.map((barber) => ({
    id: barber.id,
    name: barber.name,
    bio: barber.bio,
    branchId: barber.branchId,
    branch: barber.branch,
    schedules: barber.schedules,
    photoUrl: barber.photoUrl,
  }));
}

export async function getPublicHaircutModels() {
  const models = await db.orm.public.HaircutModel
    .where({ isPublished: true })
    .orderBy([
      (model) => model.sortOrder.asc(),
      (model) => model.createdAt.desc(),
    ])
    .all();

  const storage = await getHaircutImageStorage();
  return Promise.all(models.map(async (model) => {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      imageUrl: await createHaircutImageSignedUrl(storage, model.imagePath),
      createdAt: model.createdAt,
    };
  }));
}

export async function getPublicVacancies() {
  const now = new Date();
  return db.orm.public.CareerVacancy
    .where((vacancy) => vacancy.isPublished.eq(true))
    .where((vacancy, { fns }) =>
      fns.or(vacancy.closesAt.isNull(), vacancy.closesAt.gt(now)),
    )
    .orderBy((vacancy) => vacancy.publishedAt.desc())
    .select('id', 'title', 'description', 'publishedAt', 'closesAt', 'createdAt')
    .all();
}

export function formatOperatingHours(
  schedules: { dayOfWeek: number; open: string; close: string }[],
) {
  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return schedules.map((schedule) => ({
    ...schedule,
    dayLabel: dayLabels[schedule.dayOfWeek] ?? 'Hari',
  }));
}
