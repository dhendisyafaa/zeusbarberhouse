import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { db } from '@/src/prisma/db';
import { forbidden, unauthorized } from './errors';

function getSupabaseCredentials() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const publishableKey = process.env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];

  if (!url || !publishableKey) {
    throw new Error('Supabase URL and publishable key must be configured');
  }

  return { url, publishableKey };
}

/**
 * Creates a Supabase server client using the current request cookies.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseCredentials();

  return createServerClient(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies; proxy.ts refreshes sessions.
          }
        },
      },
    },
  );
}

/**
 * Returns the authenticated user from the Supabase session, or null.
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (
      error?.name === 'AuthSessionMissingError' ||
      error?.status === 401 ||
      error?.status === 403
    ) {
      return null;
    }

    if (error) throw error;
    return data.user;
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthSessionMissingError') {
      return null;
    }
    throw error;
  }
}

/**
 * Returns the full Profile row for the authenticated user.
 */
export async function getProfile() {
  const user = await getSession();
  if (!user) throw unauthorized();

  const profile = await db.orm.public.Profile.first({ authUserId: user.id });
  if (!profile) throw unauthorized('Profil tidak ditemukan');
  return profile;
}

/**
 * Requires ADMIN role. Throws 401/403 otherwise.
 */
export async function requireAdmin(request?: Request) {
  if (request && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    let requestOrigin: string;
    try {
      requestOrigin = new URL(request.url).origin;
    } catch {
      throw unauthorized('Origin request tidak valid');
    }

    if (!origin || origin !== requestOrigin) {
      throw forbidden('Request lintas-origin tidak diizinkan');
    }
  }

  const profile = await getProfile();
  if (profile.role !== 'ADMIN') throw forbidden();
  return profile;
}

/**
 * Requires any authenticated user (CUSTOMER or ADMIN).
 * Returns the profile.
 */
export async function requireAuth(request?: Request) {
  if (request && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    if (!origin || origin !== new URL(request.url).origin) {
      throw forbidden('Request lintas-origin tidak diizinkan');
    }
  }

  return getProfile();
}
