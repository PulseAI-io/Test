import { sql } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgSchema, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

/**
 * Dedicated Postgres schema for public marketing-site tools that never touch
 * a workspace or a signed-in user — mirrors the `system_admin` / `integration`
 * / `ai_ops` schema precedents so this stays out of the core `public` schema
 * entirely.
 */
export const marketing = pgSchema('marketing');

/**
 * Initiative Blind Spot Diagnostic submissions (see
 * `.agent/Tasks/2026-08-20-sygenti-blind-spot-diagnostic.md`).
 *
 * One row per run, upserted by `sessionId` on every answer so partial runs
 * are captured for drop-off analysis, not just completions. `answers` is the
 * full raw answer map; `pillarScores` / `pillarBands` / `archetype` /
 * `mirrorsFired` / `recommendationsShown` are the server-recomputed derived
 * fields (never trusted from the client) and stay `null` until the run
 * completes.
 */
export const diagnosticSubmissions = marketing.table(
  'diagnostic_submissions',
  {
    id: uuid().default(sql`gen_random_uuid()`).primaryKey().notNull(),
    sessionId: text('session_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),

    // Anchor
    initiativeText: text('initiative_text'),
    duration: text('duration'),
    commitment: text('commitment'),
    stillDelivering: text('still_delivering'),

    // Raw answers, keyed by question id: { value, points? }
    answers: jsonb('answers').$type<Record<string, { value: string; points?: number }>>().default({}).notNull(),

    // Derived (server-recomputed on completion)
    pillarScores: jsonb('pillar_scores').$type<{ organisation: number; team: number; self: number }>(),
    pillarBands: jsonb('pillar_bands').$type<{ organisation: string; team: string; self: string }>(),
    archetype: text('archetype'),
    mirrorsFired: jsonb('mirrors_fired').$type<string[]>().default([]).notNull(),
    recommendationsShown: jsonb('recommendations_shown').$type<string[]>().default([]).notNull(),

    // Capture
    role: text('role'),
    companySize: text('company_size'),
    sector: text('sector'),
    email: text('email'),
    emailIsFreeProvider: boolean('email_is_free_provider').default(false).notNull(),

    // Context
    referrer: text('referrer'),
    utm: jsonb('utm').$type<Record<string, string>>().default({}).notNull(),
    durationSeconds: integer('duration_seconds'),
    device: text('device').$type<'mobile' | 'desktop'>(),
    /** Last question id reached — the drop-off signal for partial runs. */
    lastQuestionId: text('last_question_id'),
  },
  (table) => [
    uniqueIndex('diagnostic_submissions_session_id_idx').on(table.sessionId),
    index('diagnostic_submissions_completed_at_idx').on(table.completedAt),
    index('diagnostic_submissions_archetype_idx').on(table.archetype),
  ]
);

export type DiagnosticSubmission = typeof diagnosticSubmissions.$inferSelect;
export type DiagnosticSubmissionInsert = typeof diagnosticSubmissions.$inferInsert;
