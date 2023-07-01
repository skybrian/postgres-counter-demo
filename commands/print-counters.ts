import "$std/dotenv/load.ts";

import { query, disconnect } from '../lib/database.ts';

const rs = await query('select id, symbol, count from counters order by id');
console.log(rs.rows);

disconnect();
