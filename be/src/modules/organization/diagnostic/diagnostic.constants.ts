/**
 * IP-based rate limiter settings for the public diagnostic endpoints.
 * `saveProgress` fires on every answer, so its window is more generous than
 * `complete`, which only fires once per run.
 */
export const DIAGNOSTIC_SAVE_WINDOW_MS = 60_000; // 1 minute
export const DIAGNOSTIC_SAVE_MAX_REQUESTS = 40; // ~15 questions plus back-nav, per minute
export const DIAGNOSTIC_COMPLETE_WINDOW_MS = 60_000;
export const DIAGNOSTIC_COMPLETE_MAX_REQUESTS = 5;
export const DIAGNOSTIC_MAX_ENTRIES = 10_000;
