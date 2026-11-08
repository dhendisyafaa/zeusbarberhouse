import { getPublicHaircutModels } from '@/lib/public-data';
import { ok, handleError } from '@/lib/api/response';

export async function GET() {
  try {
    return ok(await getPublicHaircutModels());
  } catch (error) {
    return handleError(error);
  }
}
