/** Numbers for the experience stats row, derived from the timeline data. */

export interface StatRole {
  years: string;
  kind: 'school' | 'practice';
}

/** How many schools Marwan has taught at, and the year he started teaching. */
export function experienceStats(roles: readonly StatRole[]): { schools: number; sinceYear: number | null } {
  const schools = roles.filter((role) => role.kind === 'school').length;
  const starts = roles
    .map((role) => /^\s*(\d{4})/.exec(role.years)?.[1])
    .filter((year): year is string => Boolean(year))
    .map(Number);
  return { schools, sinceYear: starts.length ? Math.min(...starts) : null };
}

/** True when a role has detail text or photos worth a "Show details" toggle. */
export function hasDetails(role: { detail?: unknown; photos: readonly unknown[] }): boolean {
  return Boolean(role.detail) || role.photos.length > 0;
}
