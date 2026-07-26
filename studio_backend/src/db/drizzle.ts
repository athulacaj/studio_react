import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../config/env';
import * as schema from './schema';

const pool = new Pool({
  connectionString: config.POSTGRESS_DATABASE_URL,
});

export const db = drizzle(pool, { schema });
