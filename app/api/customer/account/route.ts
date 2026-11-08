import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/api/auth';
import { assertSameOrigin, readJson } from '@/lib/api/request';
import { handleError, ok } from '@/lib/api/response';
import { provisionCustomerAccountSchema } from '@/lib/schemas/customer.schema';
import { provisionCustomerAccount } from '@/lib/services/customer-account.service';
import { unauthorized } from '@/lib/api/errors';

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await getSession();
    if (!user) throw unauthorized();
    const input = provisionCustomerAccountSchema.parse(await readJson(request));
    const account = await provisionCustomerAccount(user, input);
    return ok({ ready: true, membershipStatus: account.membership.status });
  } catch (error) {
    return handleError(error);
  }
}
