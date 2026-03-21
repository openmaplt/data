'use server';

import { revalidatePath } from 'next/cache';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function approveChangeset(id: string) {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  await db.query(
    `
    UPDATE patrulis.pt_changesets 
    SET approved = 1, 
        approve_date = now(), 
        approve_date_trim = to_char(now(), 'YYYY-MM-DD'), 
        approver = $1 
    WHERE id = $2
  `,
    [user, id],
  );

  await db.query(`SELECT patrulis.pt_update_status()`);

  revalidatePath('/');
}

export async function unapproveChangeset(id: string) {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  await db.query(
    `
    UPDATE patrulis.pt_changesets 
    SET approved = 0, 
        approve_date = now(), 
        approve_date_trim = to_char(now(), 'YYYY-MM-DD'), 
        approver = $1 
    WHERE id = $2
  `,
    [user, id],
  );

  await db.query(`SELECT patrulis.pt_update_status()`);

  revalidatePath('/');
}
