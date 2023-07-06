import { sendCounter, receiveCounters } from "./counterChannel.ts";
import { query } from "./database.ts";
import { Counter } from "./schema.ts";

const cache = new Map<string, Counter>();

const updateCache = (c: Counter): boolean => {
  const old = cache.get(c.id);
  if (old && c.count <= old.count) return false;
  cache.set(c.id, c);
  return true;
}

export const counterChanged = (c: Counter) => {
  if (updateCache(c)) {
    sendCounter(c);
  }
};

let loading = null as Promise<Counter[]> | null;
let ready = false;

export const refresh = () : Promise<Counter[]> => {
  if (loading) {
    return loading;
  }

  loading = (async () => {
    try {
      const rs = await query('select id, symbol, count from counters order by id');
      const rows = rs.rows as Counter[];
      for (const c of rows) {
        counterChanged(c);
      }
      ready = true;
      return rows;
    } finally {
      loading = null;
    }
  })();
  return loading;
}

export const increment = async (id: string) => {
  const rs = (await query('update counters set count = count+1 where id=$1 returning id, symbol, count', [id]));
  if (rs.rowCount != 1) {
      throw `no counter incremented for '${id}'`;
  }
  const updated = rs.rows[0] as Counter;
  counterChanged(updated);
}

export const getCounters = (): Promise<Counter[]> => {
  if (!ready) return refresh();
  return Promise.resolve([...cache.values()]);
}

receiveCounters(updateCache);
refresh();
