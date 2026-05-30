import { db } from '@/lib/db';

export async function isAdmin(username: string): Promise<boolean> {
  const result = await db.query(
    'SELECT 1 FROM patrulis.admins WHERE osm_username = $1',
    [username],
  );
  return (result.rowCount ?? 0) > 0;
}
