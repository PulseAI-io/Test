import { oc } from '@orpc/contract';
import {
  diagnosticCompleteSchema,
  diagnosticEmailReadingSchema,
  diagnosticSaveProgressSchema,
  diagnosticSubmitResultSchema,
} from '../../trpc/schemas/diagnostic.input';

/**
 * Initiative Blind Spot Diagnostic contract branch. Fully public,
 * unauthenticated — same posture as `contact`, gated only by an IP rate
 * limit (see `DiagnosticRateLimiterService`).
 */
export const diagnosticContract = {
  /** Upserted by `sessionId` on every answer, so drop-off can be analysed even on abandoned runs. */
  saveProgress: oc.input(diagnosticSaveProgressSchema).output(diagnosticSubmitResultSchema),
  /** Finalises the run: recomputes and stores the derived scoring server-side, fires the webhook. */
  complete: oc.input(diagnosticCompleteSchema).output(diagnosticSubmitResultSchema),
  /** "Email me this reading" — for a run completed without capturing an email up front. */
  emailReading: oc.input(diagnosticEmailReadingSchema).output(diagnosticSubmitResultSchema),
};
