import type { AnswerMap } from '@pulse/shared/diagnostic';
import { logger } from '@/lib/logger';
import { orpcClient } from '@/lib/orpc/client';
import type { CaptureState } from './use-diagnostic-state';

function deviceKind(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

function utmFromLocation(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}

/** Fire-and-forget autosave — never awaited by the UI, so a slow or failed request never blocks a question transition. */
export function saveDiagnosticProgress(
  sessionId: string,
  answers: AnswerMap,
  lastQuestionId?: string
): void {
  orpcClient.diagnostic
    .saveProgress({
      sessionId,
      answers,
      lastQuestionId,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      utm: utmFromLocation(),
      device: deviceKind(),
    })
    .catch((error: unknown) => {
      logger.error('Diagnostic saveProgress failed');
      logger.captureException(error);
    });
}

/**
 * Fire-and-forget completion POST. The reveal is always computed locally
 * from `@pulse/shared/diagnostic` and never waits on this — this call only
 * persists the row and triggers the webhook server-side.
 */
export function completeDiagnostic(
  sessionId: string,
  answers: AnswerMap,
  capture: CaptureState,
  startedAt: number
): void {
  orpcClient.diagnostic
    .complete({
      sessionId,
      answers,
      role: capture.role.trim(),
      companySize: capture.companySize as never,
      sector: capture.sector as never,
      email: capture.email.trim() ? capture.email.trim() : undefined,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      utm: utmFromLocation(),
      device: deviceKind(),
    })
    .catch((error: unknown) => {
      logger.error('Diagnostic complete failed');
      logger.captureException(error);
    });
}

/** "Email me this reading" — awaited so the button can show success/failure feedback. */
export async function emailReading(sessionId: string, email: string): Promise<boolean> {
  try {
    const result = await orpcClient.diagnostic.emailReading({ sessionId, email });
    return result.success;
  } catch (error) {
    logger.error('Diagnostic emailReading failed');
    logger.captureException(error);
    return false;
  }
}
