const sql = [] as string[];

export interface Row {
  readonly id: string;
  /**
   * Returns true if this is a newer version of the same row, or the row
   * didn't exist anymore (undefined).
   */
  replaces(other: Row | undefined): boolean;
}

export interface CounterStruct {
  readonly id: string;
  readonly symbol: string;
  readonly count: number;
}

export class Counter implements Row, CounterStruct {
  readonly id: string;
  readonly symbol: string;
  readonly count: number;

  constructor(obj: CounterStruct) {
    this.id = obj.id;
    this.symbol = obj.symbol;
    this.count = obj.count;
  }

  replaces(other: Counter | undefined): boolean {
    return other == null || this.id == other.id && this.count > other.count;
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
