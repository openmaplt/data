'use server';

import { revalidatePath } from 'next/cache';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function fixError(id: number, source: string) {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  await db.query(
    'UPDATE errors SET fixed = 1 WHERE error_id = $1 AND source = $2',
    [id, source],
  );
  await db.query('SELECT patrulis.pt_update_status()');

  revalidatePath('/klaidos');
  revalidatePath('/');
}
