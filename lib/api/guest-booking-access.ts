import { createHmac, timingSafeEqual } from 'node:crypto';

type GuestBookingClaims = {
  bookingId: string;
  expiresAt: number;
};

function getSigningSecret() {
  const secret = process.env['SUPABASE_SECRET_KEY'];
  if (!secret) throw new Error('Supabase server-only secret key must be configured');
  return secret;
}

function sign(payload: string) {
  return createHmac('sha256', getSigningSecret()).update(payload).digest('base64url');
}

export function createGuestBookingAccessToken(bookingId: string, expiresAt: Date) {
  const claims: GuestBookingClaims = { bookingId, expiresAt: expiresAt.getTime() };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyGuestBookingAccessToken(token: string, bookingId: string) {
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) return false;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  let claims: unknown;
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as unknown;
  } catch {
    return false;
  }
  if (typeof claims !== 'object' || claims === null) return false;
  const parsed = claims as Partial<GuestBookingClaims>;
  return parsed.bookingId === bookingId &&
    typeof parsed.expiresAt === 'number' &&
    Number.isSafeInteger(parsed.expiresAt) &&
    parsed.expiresAt > Date.now();
}
