import { db } from '@/src/prisma/db';
import { ok, handleError } from '@/lib/api/response';

export async function GET() {
  try {
    const branches = await db.orm.public.Branch
      .where({ isActive: true })
      .include('schedules')
      .orderBy((branch) => branch.name.asc())
      .all();
    return ok(branches);
  } catch (error) {
    return handleError(error);
  }
}
