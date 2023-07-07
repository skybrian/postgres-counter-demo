import { Row } from "./cache.ts";

const sql = [] as string[];

export interface CounterStruct {
  readonly id: string;
  readonly symbol: string;
  readonly count: string | number;
}

export class Counter implements Row {
  readonly id: string;
  readonly symbol: string;
  readonly count: number;

  constructor(obj: CounterStruct) {
    this.id = obj.id;
    this.symbol = obj.symbol;
    this.count = parseInt(obj.count.toString());
  }

  replaces(other: Counter | undefined): boolean {
    return other == null || this.id == other.id && this.count > other.count;
  }

  toString() {
    return JSON.stringify(this);
  }
}

sql.push(`
create table if not exists Counters (
    id varchar(40) primary key,
    symbol char(1) unique not null,
    count bigint default 0 check(count >= 0 and count <= ${Number.MAX_SAFE_INTEGER})
)
`);

const initialCounters = [
  ["🪗", "accordions"],
  ["🍎", "apples"],
  ["🍒", "cherries"],
  ["🐄", "cows"],
  ["🦆", "ducks"],
];

for (const [symbol, id] of initialCounters) {
  sql.push(
    `insert into Counters (symbol, id) values ('${symbol}', '${id}') on conflict do nothing`,
  );
}

export const getInstallScript = () => sql.slice();
