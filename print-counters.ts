import "$std/dotenv/load.ts";

// Either import URL works for a command line script
import { Pool } from 'npm:@neondatabase/serverless';
// import { Pool } from 'https://esm.sh/@neondatabase/serverless';

const pool = new Pool({ connectionString: Deno.env.get("DATABASE_URL") });

const rs = await pool.query('SELECT key, count from counters');
console.log(rs.rows);

await pool.end();