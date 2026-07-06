'use server';

import { revalidatePath } from 'next/cache';
import { unauthorized } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function deleteAddressDiff(id: number) {
  const username = await getAuthUser();
  if (!username) {
    unauthorized();
  }

  await db.query(
    `DELETE FROM address.address_diff ad
       USING address.savivaldybes s,
             patrulis.admin_savivaldybes asv,
             patrulis.admins a
      WHERE ad.id = $1
        AND s.sav_kod = ad.sav_kod
        AND asv.savivaldybe_id = s.id
        AND asv.admin_id = a.id
        AND a.osm_username = $2`,
    [id, username],
  );

  revalidatePath('/adresai');
}
