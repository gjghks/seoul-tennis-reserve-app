/**
 * Structured server-side logging for Supabase / PostgREST errors.
 *
 * Route handlers deliberately collapse DB failures into a generic 500 for the client
 * (so internals aren't leaked), but the plain `console.error(msg, error)` form buries the
 * PostgREST `code` — which is exactly what distinguishes a permission failure (42501)
 * from a constraint violation (23505), a missing ON CONFLICT target (42P10), a NOT NULL
 * violation (23502), etc. Logging those fields on one greppable line makes such incidents
 * diagnosable from Vercel logs alone.
 *
 * Server-only: this output must never be sent to the client.
 *
 * Context: added after a 2026-06 column-grant migration silently broke profile/ladder
 * saves with a 42501 that was indistinguishable from any other DB 500 in the logs.
 */
export interface DbErrorLike {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
}

export function logDbError(context: string, error: DbErrorLike | null | undefined): void {
  if (!error) {
    console.error(`[db] ${context} — unknown error (no error object)`);
    return;
  }

  const parts = [
    `code=${error.code ?? 'n/a'}`,
    `message=${JSON.stringify(error.message ?? '')}`,
  ];
  if (error.details) parts.push(`details=${JSON.stringify(error.details)}`);
  if (error.hint) parts.push(`hint=${JSON.stringify(error.hint)}`);

  console.error(`[db] ${context} — ${parts.join(' ')}`);
}
