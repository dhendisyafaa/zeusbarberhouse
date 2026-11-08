import type { NextRequest } from 'next/server';
import { assertSameOrigin } from '@/lib/api/request';
import { handleError, ok } from '@/lib/api/response';
import { createSupabaseServerClient } from '@/lib/api/auth';

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return ok({ signedOut: true });
  } catch (error) {
    return handleError(error);
  }
}
