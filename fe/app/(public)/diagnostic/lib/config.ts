import { env } from '@/envs';

/**
 * `soft` (default, per the build spec): the person can reach the reveal
 * without an email — the emailed written version and sector calibration are
 * what the email buys. `hard` would gate the reveal behind a required email.
 * Ship soft; the flag exists so this can be tested rather than argued about.
 */
export const GATE_MODE: 'hard' | 'soft' = 'soft';

export const DIAGNOSTIC_STORAGE_KEY = 'sygenti-diagnostic-v1';

export function bookingUrl(): string {
  return env.NEXT_PUBLIC_DIAGNOSTIC_BOOKING_URL?.trim() || '/contact';
}
