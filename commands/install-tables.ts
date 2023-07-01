import "$std/dotenv/load.ts";

import { query, disconnect } from '../lib/database.ts';
import { getInstallScript } from "../lib/schema.ts";

console.log("installing...");
for (const sql of getInstallScript()) {
    try {
        await query(sql);
    } catch (e) {
        console.log("failed:");
        console.log(sql);
        throw e;
    }
    console.log(".");
}
console.log("done");

disconnect();
