import { db } from '@/lib/db';

export type Municipality = {
  id: number;
  code: string;
  name: string;
};

export type AddressDiffItem = {
  id: number;
  type: string;
  city: string;
  street: string;
  housenumber: string;
  unit: string | null;
  action_open: string;
  action: string;
  x: number | null;
  y: number | null;
  note: string | null;
};

export async function getMunicipalitiesForAdmin(
  username: string,
): Promise<Municipality[]> {
  const result = await db.query(
    `SELECT s.id, s.sav_kod AS code, s.pavadinimas AS name
       FROM patrulis.admin_savivaldybes asv
       JOIN patrulis.admins a ON a.id = asv.admin_id
       JOIN address.savivaldybes s ON s.id = asv.savivaldybe_id
      WHERE a.osm_username = $1
      ORDER BY s.pavadinimas`,
    [username],
  );
  return result.rows;
}

export async function getAddressDiff(
  savKod: string,
): Promise<AddressDiffItem[]> {
  const result = await db.query(
    `SELECT ad.id, ad.type, ad.city, ad.street, ad.housenumber, ad.unit,
            ad.action_open, ad.action, ad.x, ad.y, ad.note
       FROM address.address_diff ad
      WHERE ad.sav_kod = $1
      ORDER BY ad.city, ad.street, ad.housenumber`,
    [savKod],
  );
  return result.rows;
}

export async function hasMunicipalitiesAssigned(
  username: string,
): Promise<boolean> {
  const result = await db.query(
    `SELECT 1 FROM patrulis.admin_savivaldybes asv
       JOIN patrulis.admins a ON a.id = asv.admin_id
      WHERE a.osm_username = $1
      LIMIT 1`,
    [username],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getAddressDiffCountForAdmin(
  username: string,
): Promise<number> {
  const result = await db.query(
    `SELECT count(1) AS total
       FROM address.address_diff ad
       JOIN address.savivaldybes s ON s.sav_kod = ad.sav_kod
       JOIN patrulis.admin_savivaldybes asv ON asv.savivaldybe_id = s.id
       JOIN patrulis.admins a ON a.id = asv.admin_id
      WHERE a.osm_username = $1`,
    [username],
  );
  return parseInt(result.rows[0].total, 10);
}
