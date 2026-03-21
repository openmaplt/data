import { db } from '@/lib/db';

export type OSUser = {
  userid: string;
  known_from: string | Date;
  last_edit: string | Date;
  lt_edit_count: number;
  send_message: 'N' | 'I' | 'R';
};

export async function getNewUsers(): Promise<OSUser[]> {
  const query = `
    SELECT userid
         , known_from
         , last_edit
         , lt_edit_count
         , send_message
    FROM patrulis.pt_users
    ORDER BY id DESC
    LIMIT 15
  `;
  const result = await db.query(query);
  return result.rows;
}

export async function getNewUsersCount(): Promise<number> {
  const result = await db.query(
    "SELECT count(1) as total FROM patrulis.pt_users WHERE send_message = 'R'",
  );
  return Number(result.rows[0].total);
}
