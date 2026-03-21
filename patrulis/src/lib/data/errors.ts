import { db } from '@/lib/db';

export type ErrorItem = {
  error_id: number;
  error_name: string;
  object_type: string;
  object_id: string;
  description: string;
  first_occurrence: string;
  object_timestamp: string;
  user_name: string;
  source: string;
  lat: number;
  lon: number;
};

export async function getErrors(): Promise<ErrorItem[]> {
  const query = `
    SELECT error_name
         , object_type
         , object_id
         , description
         , to_char(first_occurrence, 'YYYY-MM-DD HH24:MI') as first_occurrence
         , to_char(object_timestamp, 'YYYY-MM-DD HH24:MI') as object_timestamp
         , error_id
         , source
         , lat / 1000000.0 as lat
         , lon / 1000000.0 as lon
    FROM errors
    WHERE coalesce(fixed, 0) = 0
    ORDER BY CASE WHEN schema IS NULL THEN 1 ELSE 2 END
           , error_name
           , description
    LIMIT 20
  `;
  const result = await db.query(query);
  return result.rows;
}

export async function getErrorCount(): Promise<number> {
  const query = `
    SELECT count(1) as total
    FROM errors
    WHERE coalesce(fixed, 0) = 0
  `;
  const result = await db.query(query);
  return parseInt(result.rows[0].total, 10);
}
