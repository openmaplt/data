import { db } from '@/lib/db';

export type Changeset = {
  id: string;
  user_name: string;
  comment: string;
  requested: number | null;
  didelis: number | null;
  approved: number;
  uzsienis: number | null;
  approver?: string;
  approve_time?: string;
  valandu?: number;
};

export async function getUnapprovedChangesets(): Promise<Changeset[]> {
  const query = `
    SELECT id, user_name,
           substring(comment from 22) as comment,
           requested, didelis, approved, uzsienis
      FROM patrulis.pt_changesets
     WHERE approved = 0
    ORDER BY id
  `;
  const result = await db.query(query);
  return result.rows;
}

export async function getApprovedChangesets(): Promise<Changeset[]> {
  const query = `
    SELECT id, user_name,
           substring(comment from 22) as comment,
           requested, didelis, approved, uzsienis, approver, to_char(approve_date, 'HH24:MI') as approve_time,
           (extract(epoch from now()) - extract(epoch from approve_date)) / (60 * 60) as valandu
      FROM patrulis.pt_changesets
     WHERE approved = 1
       AND now() - approve_date < interval '1 day'
    ORDER BY approve_date DESC
    LIMIT 15
  `;
  const result = await db.query(query);
  return result.rows;
}

export async function getUnapprovedCount(): Promise<number> {
  const query = `
    SELECT count(1) as total
      FROM patrulis.pt_changesets
     WHERE approved = 0
  `;
  const result = await db.query(query);
  return parseInt(result.rows[0].total, 10);
}
