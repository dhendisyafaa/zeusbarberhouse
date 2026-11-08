import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/api/auth';
import { provisionCustomerAccount } from '@/lib/services/customer-account.service';

export async function GET(request: NextRequest) {
  const oauthError = request.nextUrl.searchParams.get('error');
  const authErrorUrl = new URL('/login', request.url);
  authErrorUrl.searchParams.set('error', 'google');

  if (oauthError) return NextResponse.redirect(authErrorUrl);

  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(authErrorUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(authErrorUrl);
  }

  const providers = data.user.app_metadata['providers'];
  const isGoogleUser =
    data.user.app_metadata['provider'] === 'google' ||
    (Array.isArray(providers) && providers.includes('google'));
  if (!isGoogleUser || !data.user.email_confirmed_at) {
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    if (signOutError) console.error('[OAuth session cleanup]', signOutError);
    return NextResponse.redirect(authErrorUrl);
  }

  try {
    await provisionCustomerAccount(data.user);
  } catch (provisionError) {
    console.error('[Customer account provisioning]', provisionError);
    const setupErrorUrl = new URL('/login', request.url);
    setupErrorUrl.searchParams.set('error', 'setup');
    return NextResponse.redirect(setupErrorUrl);
  }

  return NextResponse.redirect(new URL('/', request.url));
}
