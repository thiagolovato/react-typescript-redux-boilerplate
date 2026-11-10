import { execFileSync } from 'node:child_process';
import { AUTH_DB, CORE_DB, REDIS_CONTAINER } from './env';

type Database = typeof AUTH_DB;

// psql with -A prints rows one per line and columns split by this character.
const PSQL_COLUMN_SEPARATOR = '|';
// psql prints booleans as t / f.
const PSQL_TRUE = 't';

/**
 * Runs SQL with psql inside a local database container and returns the rows as lists of column texts.
 * Values go in as psql variables (:'name'), never pasted into the SQL text.
 */
function runSql(db: Database, sql: string, vars: Record<string, string> = {}): string[][] {
  const varArgs = Object.entries(vars).flatMap(([name, value]) => ['-v', `${name}=${value}`]);
  const output = execFileSync(
    'docker',
    ['exec', '-i', db.container, 'psql', '-U', db.user, '-d', db.database, '-v', 'ON_ERROR_STOP=1', '-qtA', ...varArgs],
    { input: sql, encoding: 'utf8' },
  );
  return output.split('\n').filter((line) => line.length > 0).map((line) => line.split(PSQL_COLUMN_SEPARATOR));
}

export const runAuthSql = (sql: string, vars?: Record<string, string>) => runSql(AUTH_DB, sql, vars);
export const runCoreSql = (sql: string, vars?: Record<string, string>) => runSql(CORE_DB, sql, vars);

/** A boolean column as psql prints it. */
export const psqlBoolean = (value: string): boolean => value === PSQL_TRUE;

// redis-cli reads the password from REDISCLI_AUTH; the container already has it as REDIS_PASSWORD.
const REDIS_CLI = 'REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli "$@"';

function runRedisCli(...args: string[]): string {
  return execFileSync('docker', ['exec', REDIS_CONTAINER, 'sh', '-c', REDIS_CLI, 'redis-cli', ...args], { encoding: 'utf8' });
}

/**
 * Deletes every login-attempt counter (per account and per IP). All test traffic comes from one IP, so the
 * per-IP limit (50 failed logins in 15 minutes) would otherwise block later runs. Local stack only.
 */
export function clearLoginAttempts(): void {
  const keys = runRedisCli('--scan', '--pattern', 'auth:login-attempts:*').split('\n').filter(Boolean);
  if (keys.length > 0) {
    runRedisCli('DEL', ...keys);
  }
}
