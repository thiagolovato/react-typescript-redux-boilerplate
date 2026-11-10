export const MS_PER_DAY = 86_400_000;

// Age of the participants the tests create, well inside the allowed range.
export const ADULT_AGE = 30;

/** `YYYY-MM-DD` of a date, in UTC. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 'YYYY-MM-DD'.length);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export const today = (): string => toIsoDate(new Date());

/** Birth date that makes the person `years` old today (UTC). `extraDays` moves it further back. */
export function birthDateForAge(years: number, extraDays = 0): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - years);
  return toIsoDate(addDays(date, -extraDays));
}
