import { requireAuth } from '@/lib/api/auth';
import { db } from '@/src/prisma/db';
import { ok, handleError } from '@/lib/api/response';
import { notFound } from '@/lib/api/errors';
import type { NextRequest } from 'next/server';
import { updateCustomerProfileSchema } from '@/lib/schemas/customer.schema';
import { readJson } from '@/lib/api/request';

async function getCustomerProfile(profileId: string) {
  const customer = await db.orm.public.Customer
    .where({ profileId })
    .select('id', 'name', 'email', 'phone', 'createdAt', 'updatedAt')
    .first();
  if (!customer) throw notFound('Profil pelanggan');
  return customer;
}

export async function GET(request: NextRequest) {
  try {
    const profile = await requireAuth(request);
    const customer = await getCustomerProfile(profile.id);
    return ok({ profile: { id: profile.id, role: profile.role }, customer });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const profile = await requireAuth(request);
    const body = await readJson(request);
    const input = updateCustomerProfileSchema.parse(body);
    const updateData = {
      ...input,
      ...(input.email !== undefined ? { email: input.email || null } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
    };

    const existing = await db.orm.public.Customer.first({ profileId: profile.id });
    if (!existing) throw notFound('Profil pelanggan');

    const updated = await db.orm.public.Customer
      .where({ profileId: profile.id })
      .select('id', 'name', 'email', 'phone', 'updatedAt')
      .update(updateData);

    if (!updated) throw notFound('Profil pelanggan');
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
