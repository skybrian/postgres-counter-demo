import "$std/dotenv/load.ts";
import { Pool } from 'npm:@neondatabase/serverless';

const pool = new Pool({ connectionString: Deno.env.get("DATABASE_URL") });

const rs = await pool.query('SELECT key, count from counters');
console.log(rs.rows);

await pool.end();