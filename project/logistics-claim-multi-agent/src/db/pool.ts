import { Pool } from 'pg';
import { config } from '../config.js';

export const pool = new Pool({ connectionString: config.databaseUrl, max: 10 });

export async function query<T extends import('pg').QueryResultRow = any>(sql: string, params: unknown[] = []) {
  const res = await pool.query(sql, params as any[]);
  return res.rows as T[];
}
