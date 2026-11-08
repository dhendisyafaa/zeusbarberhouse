import { db } from '@/src/prisma/db';
import { ok, handleError } from '@/lib/api/response';

export async function GET() {
  try {
    const services = await db.orm.public.Service
      .where({ isActive: true })
      .orderBy([(service) => service.sortOrder.asc(), (service) => service.name.asc()])
      .all();
    return ok(services);
  } catch (error) {
    return handleError(error);
  }
}
