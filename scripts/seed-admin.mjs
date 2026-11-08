import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import postgres from '@prisma/orm-postgres/runtime';
import { contractFromJson } from '@prisma/orm-postgres/static';
import contractJson from '../src/prisma/contract.json' with { type: 'json' };

const requiredEnvironment = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
];

const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);
if (missingEnvironment.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
  process.exitCode = 1;
} else {
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (password.length < 12) {
    console.error('ADMIN_PASSWORD must be at least 12 characters.');
    process.exitCode = 1;
  } else {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
    const contract = contractFromJson(contractJson);
    const db = postgres({ contract, url: process.env.DATABASE_URL });

    try {
      let authUser = null;
      let page = 1;
      let hasNextPage = true;

      while (!authUser && hasNextPage) {
        const { data, error } = await supabase.auth.admin.listUsers({
          page,
          perPage: 1000,
        });
        if (error) throw error;

        authUser = data.users.find(
          (user) => user.email?.toLowerCase() === email,
        ) ?? null;
        hasNextPage = data.users.length === 1000;
        page += 1;
      }

      if (authUser) {
        const { data, error } = await supabase.auth.admin.updateUserById(
          authUser.id,
          { password, email_confirm: true },
        );
        if (error) throw error;
        authUser = data.user;
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error) throw error;
        authUser = data.user;
      }

      const profile = await db.orm.public.Profile.first({
        authUserId: authUser.id,
      });

      if (profile) {
        if (profile.role !== 'ADMIN') {
          await db.orm.public.Profile
            .where({ id: profile.id })
            .update({ role: 'ADMIN' });
        }
      } else {
        await db.orm.public.Profile.create({
          authUserId: authUser.id,
          role: 'ADMIN',
        });
      }

      console.log(`Admin account and profile are ready for ${email}.`);
    } catch (error) {
      console.error(
        'Could not seed the admin account:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      process.exitCode = 1;
    } finally {
      await db.close();
    }
  }
}
