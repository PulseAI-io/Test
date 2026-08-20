# Sygenti Initiative Blind Spot Diagnostic — source snapshot

This is a standalone snapshot of the source files for the Sygenti Initiative
Blind Spot Diagnostic, pulled out of the `pulse` monorepo at
`PulseAI-io/pulse#821` (branch `claude/sygenti-blind-spot-diagnostic-xdkido`).
That PR is the real, buildable, tested version of this feature — this repo
exists to hold just the diagnostic's own files without the rest of the pulse
codebase.

## What's here

Paths mirror their location in `pulse` exactly, so anyone can copy a
directory back in verbatim:

- `packages/shared/src/diagnostic/` — the pure logic: question data, scoring,
  all nine mirror rules, archetype resolution, recommendation library, and a
  banned-word copy linter. Framework-agnostic, `bun:test`-covered (59 tests
  in the original repo).
- `packages/shared/src/orpc/contracts/diagnostic.contract.ts` and
  `packages/shared/src/trpc/schemas/diagnostic.input.ts` — the wire contract.
- `packages/db/src/marketing-schema.ts` and
  `packages/db/migrations/0315_add_diagnostic_submissions.sql` — the new
  `marketing` Postgres schema and its one table.
- `be/src/modules/organization/diagnostic/` and
  `be/src/orpc/routers/diagnostic.orpc.ts` — the NestJS module and oRPC
  controller.
- `fe/app/(public)/diagnostic/` — the Next.js route: layout with scoped
  fonts/tokens, the state machine, and every screen component.
- `.agent/Tasks/2026-08-20-sygenti-blind-spot-diagnostic.md` — the build
  writeup: architecture decisions, two spec gaps resolved and documented,
  and what was verified.

## What's NOT here, on purpose

This is source only, not a runnable app. Left out:

- The rest of the `pulse` monorepo — `package.json`/`tsconfig.json`/lockfile,
  the NestJS bootstrap, the Next.js app shell, every other feature module.
  Nothing here will `bun install` or `bun dev` on its own.
- `packages/db/migrations/meta/*_snapshot.json` — drizzle-kit's generated,
  whole-database schema snapshot. It's a mechanical build artifact of the
  full pulse schema (16,000+ lines), not diagnostic-specific; regenerate it
  with `drizzle-kit generate` against the real schema instead of copying it.
- Nine pre-existing pulse files that needed a small edit to wire this in
  (env var, nav link, middleware allowlist, oRPC contract/module
  registration, etc.) — copying each whole file made no sense here since
  the diagnostic-relevant part of each is a few lines out of hundreds or
  thousands. Every one of those edits is in **`INTEGRATION.diff`** instead,
  as a real unified diff against the file it patches.

## To actually wire this into a project

1. Drop the directories above into the target repo at the same paths.
2. Apply `INTEGRATION.diff` (or make the equivalent edits by hand — it's
   nine small, self-contained hunks).
3. Run that project's own `drizzle-kit generate` to produce a real migration
   snapshot for the new `marketing.diagnostic_submissions` table.
4. Whatever that project's DB access layer, oRPC/RPC transport, and queue
   service look like will need to match what `diagnostic.service.ts` and
   `diagnostic.orpc.ts` assume (a `DatabaseService.schema`-style Drizzle
   handle, an `@orpc/nest`-style controller, a `QueueService.send(...)`
   for the "email me this reading" path). This code assumes pulse's specific
   shapes for all three.

## Origin

- Real PR (buildable, CI-checked, reviewable): https://github.com/PulseAI-io/pulse/pull/821
- Branch: `claude/sygenti-blind-spot-diagnostic-xdkido`
