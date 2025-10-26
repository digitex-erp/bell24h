import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const {
  PGHOST,
  PGPORT,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  DATABASE_URL,
  NODE_ENV,
} = process.env as Record<string, string | undefined>;

const pool =
  PGHOST || PGUSER || PGPASSWORD || PGDATABASE
    ? new Pool({
        host: PGHOST,
        port: Number(PGPORT || 5432),
        user: PGUSER,
        password: PGPASSWORD,
        database: PGDATABASE,
        ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      })
    : new Pool({
        connectionString: DATABASE_URL,
        ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      } as any);

export async function GET() {
  try {
    const { rows } = await pool.query(
      'select id, company_name, email, phone, city, state, category, slug from suppliers where coalesce(is_claimed,false)=false limit 50'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}