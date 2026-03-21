'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function updateUserStatus(userid: string, status: 'I' | 'N') {
  try {
    // 1. Update status
    await db.query(
      'UPDATE patrulis.pt_users SET send_message = $1 WHERE userid = $2',
      [status, userid],
    );

    // 2. Refresh global state/stats
    await db.query('SELECT patrulis.pt_update_status()');

    revalidatePath('/naujokai');
    revalidatePath('/'); // For the header counter
  } catch (error) {
    console.error('Failed to update user status:', error);
    throw new Error('Nepavyko atnaujinti vartotojo būsenos');
  }
}
