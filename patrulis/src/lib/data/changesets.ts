// import { db } from '@/lib/db';

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
  // Laikini mock duomenys testavimui, kol bus sukurta pt_changesets lentelė
  const mockData: Changeset[] = [
    {
      id: '160000001',
      user_name: 'Antanas',
      comment: 'Added some building heights in Vilnius',
      requested: 1,
      didelis: 0,
      approved: 0,
      uzsienis: 0,
    },
    {
      id: '160000002',
      user_name: 'Jonas',
      comment: 'Fixing road naming in Kaunas',
      requested: 0,
      didelis: 1,
      approved: 0,
      uzsienis: 0,
    },
    {
      id: '160000003',
      user_name: 'Petras',
      comment: 'Imports of landuse data from unknown source',
      requested: 0,
      didelis: 1,
      approved: 0,
      uzsienis: 2,
    },
    {
      id: '160000004',
      user_name: 'Tomas',
      comment: 'Updating shop tags',
      requested: 1,
      didelis: 0,
      approved: 0,
      uzsienis: 1,
    },
  ];
  return mockData;

  /*
	const query = `
    SELECT id, user_name,
           substring(comment from 22) as comment,
           requested, didelis, approved, uzsienis
      FROM pt_changesets
     WHERE approved = 0
    ORDER BY id
  `;
	const result = await db.query(query);
	return result.rows;
  */
}

export async function getApprovedChangesets(): Promise<Changeset[]> {
  // Laikini mock duomenys testavimui, kol bus sukurta pt_changesets lentelė
  const mockData: Changeset[] = [
    {
      id: '159999990',
      user_name: 'Giedrius',
      comment: 'Minor tag fixes',
      requested: 0,
      didelis: 0,
      approved: 1,
      uzsienis: 0,
      approver: 'patrulis',
      approve_time: '14:20',
      valandu: 1.5,
    },
    {
      id: '159999980',
      user_name: 'Marius',
      comment: 'Major road network update',
      requested: 1,
      didelis: 1,
      approved: 1,
      uzsienis: 0,
      approver: 'patrulis',
      approve_time: '12:05',
      valandu: 3.8,
    },
    {
      id: '159999970',
      user_name: 'Vasilij',
      comment: 'Translating names',
      requested: 0,
      didelis: 0,
      approved: 1,
      uzsienis: 2,
      approver: '[auto]',
      approve_time: '09:15',
      valandu: 6.7,
    },
  ];
  return mockData;

  /*
	const query = `
    SELECT id, user_name,
           substring(comment from 22) as comment,
           requested, didelis, approved, uzsienis, approver, to_char(approve_date, 'HH24:MI') as approve_time,
           (extract(epoch from now()) - extract(epoch from approve_date)) / (60 * 60) as valandu
      FROM pt_changesets
     WHERE approved = 1
       AND now() - approve_date < interval '1 day'
    ORDER BY approve_date DESC
    LIMIT 15
  `;
	const result = await db.query(query);
	return result.rows;
  */
}
