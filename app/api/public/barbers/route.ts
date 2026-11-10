import type { NextRequest } from 'next/server';
import { parseUuid } from '@/lib/api/request';
import { handleError, ok } from '@/lib/api/response';
import { getPublicBarbers } from '@/lib/public-data';

export async function GET(request: NextRequest) {
  try {
    const rawBranchId = request.nextUrl.searchParams.get('branchId');
    const branchId = rawBranchId ? parseUuid(rawBranchId, 'ID cabang') : null;
    return ok(await getPublicBarbers(branchId));
  } catch (error) {
    return handleError(error);
  }
}
