# Sygenti — Initiative Blind Spot Diagnostic (Aug 20, 2026)

**Status:** Shipped, `GATE_MODE: 'soft'`
**Route:** `/diagnostic` (fe/app/(public)/diagnostic/)
**Spec:** build spec supplied in the task prompt, v1.0, 20 Aug 2026 — implemented section by section against its 14 acceptance criteria.

## What this is

A standalone, fifteen-question diagnostic embedded on the marketing site (not
an iframe, a real Next.js page) that gives someone a reading of where their
sightlines fail on one named initiative: three pillar bands (Organisation /
Team / Self), up to three "mirror" contradictions pulled from their own
answers, an archetype headline, three doable-this-week recommendations, and a
single ask (book thirty minutes). No score out of 100, no iframe widget.

## Architecture

**Pure logic lives in `packages/shared/src/diagnostic/`** (question data,
scoring, mirror rules, archetype resolution, recommendation library, banned-
word copy lint, `evaluateDiagnostic()` combinator), tested with `bun:test`
(59 tests) rather than the FE's vitest — this is framework-agnostic, shared
by both FE (instant client-side reveal) and BE (server-recomputed system of
record). Import via `@pulse/shared/diagnostic`.

**Reveal is computed twice, deliberately:**
- Client-side, synchronously, from `evaluateDiagnostic(answers)` — this is
  what renders instantly and never waits on the network (spec: "No analytics
  that block the reveal. Fire and forget").
- Server-side, inside `DiagnosticService.complete()`, from the *same* pure
  function — this is the row that gets stored. The server never trusts a
  client-computed score for storage.

**Autosave** (`saveDiagnosticProgress`) fires on every question transition,
fire-and-forget, upserted by a client-generated `sessionId` — this is what
makes partial-run drop-off analysis possible per §10. `completeDiagnostic`
fires once on reaching the reveal. Neither blocks rendering.

**DB:** new `marketing` Postgres schema (mirrors the `system_admin` /
`integration` / `ai_ops` schema precedent — public tools with no workspace/
user FK have no business in `public`), one table
`marketing.diagnostic_submissions` (`packages/db/src/marketing-schema.ts`,
migration `0313_add_diagnostic_submissions.sql`). Upserted by `session_id`
(unique index) so a partial run and its later completion are the same row.

**BE:** `DiagnosticModule` / `DiagnosticService` / `DiagnosticRateLimiterService`
mirror `ContactModule`'s pattern exactly (public, no RBAC, in-memory per-IP
rate limit — `saveProgress` gets a generous 40/min window since it fires per
question, `complete`/`emailReading` get 5/min). oRPC branch `diagnostic` in
`packages/shared/src/orpc/contract.ts`, controller
`be/src/orpc/routers/diagnostic.orpc.ts` registered in `orpc.module.ts`'s
`DOMAIN_ROUTERS`. `DIAGNOSTIC_WEBHOOK_URL` (optional env var) fires a
fire-and-forget POST of the full row on completion — no existing "configurable
webhook, fire-and-forget POST" pattern existed in the codebase; this is a new
one, deliberately NOT routed through `QueueService` (that's for durable job
processing, not a plain outbound webhook).

**"Email me this reading"** (§9 secondary action) sends the rendered reading
through the existing `QueueService` → `NOTIFICATION` queue → email worker
path, same as `ContactService.sendEmail`, rendered via
`@pulse/shared/emails/email-shell`'s `renderEmailShell`/`renderAccentBlock`.

**FE:** `fe/app/(public)/diagnostic/` is a self-contained route with its own
`layout.tsx` loading Sora + JetBrains Mono (next/font/google) scoped to a
`.diag` wrapper class and its own `diagnostic.css` token file (the §11 colour
tokens, e.g. `--ink`, `--teal`, `--cream`) — deliberately NOT registered on
global `:root`/`@theme`, so the rest of the marketing site's shadcn tokens
are untouched. State machine (`use-diagnostic-state.ts`) persists to
`sessionStorage` on every change and restores on mount, satisfying "refresh
mid-run restores position" (acceptance criterion 7) — verified live in a
browser, not just by reading the code.

**Middleware:** `/diagnostic` had to be added to
`fe/lib/workos/middleware.ts`'s `PUBLIC_PATH_PREFIXES` allowlist — every other
`(public)` route is there (`/pricing`, `/contact`, etc.) but a new route isn't
automatically public; without this the AuthKit middleware 307s an
unauthenticated visitor to `/`. Easy to miss, only caught by an actual
browser smoke test against a running dev server.

## Two underspecified spots in the spec, resolved and documented in code

1. **Archetype resolution** (§8) only covers 20 of the 27 possible pillar-band
   combinations with its six explicit rules. `resolveArchetype()` in
   `packages/shared/src/diagnostic/archetypes.ts` adds two documented
   fallbacks: self=blind alongside two non-blind-but-not-sighted pillars
   resolves to "the one who already knows" (same story as rule 1, just
   neither other pillar reached "sighted"); any blind-free mix that isn't
   uniformly partial or uniformly sighted resolves to "sighted, unowned".
   Covered by dedicated tests.
2. **Mirror fallback with zero fired rules on a maximally-blank answer set**
   — `fallbackLines()` originally required a question to already be
   *answered* to feature it, which meant a genuinely empty answer map (only
   reachable via a malformed/partial submission, never through the real UI
   flow) produced zero fallback lines, violating "never show an empty mirror
   section" (acceptance criterion 4). Fixed to use the shown-question set
   regardless of whether it's answered yet.

## Verification

- `bun test src/diagnostic/` in `packages/shared`: 59 passing, including
  every one of M1-M9 triggered in isolation, both archetype fallbacks, the
  Q12-skipped-scores-out-of-8 rule, and the full banned-word list scanned
  against every question/mirror/archetype/recommendation/interface string.
- `bun run typecheck` clean in `packages/shared`, `be`, `packages/db`, and
  `fe` (the one remaining FE typecheck failure,
  `hooks/delivery/milestones/use-milestone-decision-dialog.ts:120`, predates
  this branch and is unrelated).
- `bun run db:generate` in `packages/db` reports "No schema changes, nothing
  to migrate" against the hand-authored `0313` migration + snapshot — see
  the sandbox note below for why it was hand-authored in the first place.
- Live browser verification (Playwright against a real `next dev` + mocked
  BE) of: the full A1→A4→Q1→Q15→capture→reveal flow, Q12 showing only when
  Q11 is "Yes"/"I have wondered" and being skipped (landing straight on Q13)
  when Q11 is "No", the pillar eyebrow position counting correctly through
  all three pillars, sessionStorage restore after a hard refresh mid-run,
  and the reveal rendering the initiative quote, archetype headline, three
  pillar bands, mirror passages, recommendations, and ask section correctly
  — including the reveal spine's break marks on Structurally-blind pillars.
- Not independently re-verified: sub-4-minute completion time on a real
  device (the spec's own target, "test it"), and the actual webhook/email
  send against a live queue worker (verified the code path and payload
  shape, not a live send).

## Sandbox note (not app behaviour, just how this shipped)

`bun install` at the repo root hung indefinitely partway through in this
build's sandbox (stalled ~10+ minutes with zero further download progress,
no proxy error — looked like a stuck socket, not a policy block). Scoped
`bun install --filter=<package>` resolved instantly afterwards using what
had already been cached, so `packages/db`'s `drizzle-kit generate` could
still run for real — the migration and its `meta/0313_snapshot.json` are
tool-verified (`bun db:generate` reports zero drift against them), not
hand-guessed SQL. Documented in case another session hits the same stall.
