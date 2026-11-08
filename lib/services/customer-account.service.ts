import type { User } from '@supabase/supabase-js';
import { forbidden, validationError } from '@/lib/api/errors';
import type { ProvisionCustomerAccountInput } from '@/lib/schemas/customer.schema';
import { db } from '@/src/prisma/db';

function getMetadataString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function provisionCustomerAccount(
  user: User,
  input: ProvisionCustomerAccountInput = {},
) {
  const providers = user.app_metadata['providers'];
  const isGoogleUser =
    user.app_metadata['provider'] === 'google' ||
    (Array.isArray(providers) && providers.includes('google'));
  if (!isGoogleUser || !user.email_confirmed_at) {
    throw forbidden('Akun pelanggan harus menggunakan Google dengan email terverifikasi');
  }

  const email = user.email?.trim().toLowerCase();
  if (!email) throw validationError('Akun pelanggan harus memiliki email');

  const metadata = user.user_metadata as Record<string, unknown>;
  const name = input.name
    || getMetadataString(metadata['full_name'])
    || getMetadataString(metadata['name'])
    || email.split('@')[0];
  const phone = input.phone ?? getMetadataString(metadata['phone']);

  return db.transaction(async (tx) => {
    let profile = await tx.orm.public.Profile.first({ authUserId: user.id });
    if (!profile) {
      profile = await tx.orm.public.Profile.create({
        authUserId: user.id,
        role: 'CUSTOMER',
      });
    }
    if (profile.role !== 'CUSTOMER') throw forbidden('Akun ini bukan akun pelanggan');

    let customer = await tx.orm.public.Customer.first({ profileId: profile.id });
    if (!customer) {
      customer = await tx.orm.public.Customer.create({
        profileId: profile.id,
        name,
        email,
        phone: phone || null,
      });
    }

    let membership = await tx.orm.public.Membership.first({ customerId: customer.id });
    if (!membership) {
      membership = await tx.orm.public.Membership.create({
        customerId: customer.id,
        status: 'ACTIVE',
        activatedAt: new Date(),
        expiresAt: null,
      });
    }

    return { profile, customer, membership };
  });
}

export async function expireDueMemberships(now = new Date()) {
  await db.orm.public.Membership
    .where((membership) => membership.status.eq('ACTIVE'))
    .where((membership) => membership.expiresAt.lte(now))
    .update({ status: 'EXPIRED' });
}
