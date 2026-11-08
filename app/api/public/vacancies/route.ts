import { getPublicVacancies } from '@/lib/public-data';
import { ok, handleError } from '@/lib/api/response';

export async function GET() {
  try {
    return ok(await getPublicVacancies());
  } catch (error) {
    return handleError(error);
  }
}
