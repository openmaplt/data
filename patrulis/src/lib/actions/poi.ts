'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Accepts a POI change by calling the accept_change function in the database.
 */
export async function acceptPOIChange(
  osm_id: number,
  obj_type: string,
  x_type: string,
) {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // select places.accept_change(osm_id, obj_type, x_type)
  await db.query('SELECT places.accept_change($1, $2, $3)', [
    osm_id,
    obj_type,
    x_type,
  ]);

  revalidatePath('/poi');
  revalidatePath('/');
  redirect('/poi');
}

/**
 * Transfers a POI ID by calling the transfer_id function in the database.
 */
export async function transferPOI(
  old_osm_id: number,
  old_type: string,
  new_osm_id: number,
  new_type: string,
  change: string,
  uid: number,
) {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // select places.transfer_id(old_osm_id, old_type, new_osm_id, new_type, change, uid)
  await db.query('SELECT places.transfer_id($1, $2, $3, $4, $5, $6)', [
    old_osm_id,
    old_type,
    new_osm_id,
    new_type,
    change,
    uid,
  ]);

  revalidatePath('/poi');
  revalidatePath(`/poi/${old_type}${old_osm_id}`);
  revalidatePath('/');
}
