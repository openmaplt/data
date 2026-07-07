import { db } from '@/lib/db';

export type AdminRole = 'admin' | 'editor';

export async function getAdminRole(
  username: string,
): Promise<AdminRole | null> {
  const result = await db.query(
    'SELECT role FROM patrulis.admins WHERE osm_username = $1',
    [username],
  );
  return (result.rows[0]?.role as AdminRole | undefined) ?? null;
}
