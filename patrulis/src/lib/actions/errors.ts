'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function fixError(id: number, source: string) {
  await requireAdmin();

  await db.query(
    'UPDATE errors SET fixed = 1 WHERE error_id = $1 AND source = $2',
    [id, source],
  );
  await db.query('SELECT patrulis.pt_update_status()');

  revalidatePath('/klaidos');
  revalidatePath('/');
}
