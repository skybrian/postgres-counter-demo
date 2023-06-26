import "$std/dotenv/load.ts";

import { query, disconnect } from './lib/database.ts';

const rs = await query('select key, symbol, count from counters');
console.log(rs.rows);
disconnect();
