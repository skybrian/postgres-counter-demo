const sql = [] as string[];

export interface Counter {
    key: string,
    symbol: string,
    count: number
}

sql.push(`
create table if not exists Counters (
    key varchar(40) primary key,
    symbol char(1) unique not null,
    count bigint default 0 check(count >= 0 and count <= ${Number.MAX_SAFE_INTEGER})
)
`)

const initialCounters = [
    [ "🪗", "accordions" ],
    [ "🍎", "apples" ],
    [ "🍒", "cherries" ],
    [ "🐄", "cows" ],
    [ "🦆", "ducks" ]
  ]

for (const [symbol, key] of initialCounters) {
    sql.push(`insert into Counters (symbol, key) values ('${symbol}', '${key}') on conflict do nothing`)
}
 
export const getInstallScript = () => sql.slice();
