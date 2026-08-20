import { Injectable, Logger } from '@nestjs/common';
import {
  BAND_LABEL,
  BAND_READING,
  DIAGNOSTIC_COPY,
  evaluateDiagnostic,
  isFreeEmailProvider,
  PILLAR_LABEL,
  type RevealResult,
} from '@pulse/shared/diagnostic';
import { renderAccentBlock, renderEmailShell } from '@pulse/shared/emails/email-shell';
import type {
  DiagnosticCompleteInput,
  DiagnosticSaveProgressInput,
  DiagnosticSubmitResult,
} from '@pulse/shared/trpc/schemas/diagnostic.input';
import { sql } from 'drizzle-orm';
import { ConfigService } from '@/core/config/config.service';
import { DatabaseService } from '@/core/database/database.service';
import { QueueService } from '@/jobs/queue/queue.service';
import { type EmailWorkItem, QUEUE_NAMES } from '@/jobs/queue/queue.types';
import { escapeHtml } from '@/utils/html';

@Injectable()
export class DiagnosticService {
  private readonly logger = new Logger(DiagnosticService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService,
    private readonly queueService: QueueService
  ) {}

  async saveProgress(input: DiagnosticSaveProgressInput): Promise<DiagnosticSubmitResult> {
    const { diagnosticSubmissions } = this.database.schema;

    try {
      await this.database.db
        .insert(diagnosticSubmissions)
        .values({
          sessionId: input.sessionId,
          answers: input.answers,
          initiativeText: input.answers.A1?.value ?? null,
          duration: input.answers.A2?.value ?? null,
          commitment: input.answers.A3?.value ?? null,
          stillDelivering: input.answers.A4?.value ?? null,
          lastQuestionId: input.lastQuestionId ?? null,
          referrer: input.referrer ?? null,
          utm: input.utm ?? {},
          device: input.device,
        })
        .onConflictDoUpdate({
          target: diagnosticSubmissions.sessionId,
          set: {
            answers: input.answers,
            initiativeText: input.answers.A1?.value ?? null,
            duration: input.answers.A2?.value ?? null,
            commitment: input.answers.A3?.value ?? null,
            stillDelivering: input.answers.A4?.value ?? null,
            lastQuestionId: input.lastQuestionId ?? null,
            referrer: input.referrer ?? null,
            utm: input.utm ?? {},
            device: input.device,
            updatedAt: sql`now()`,
          },
        });

      return { success: true };
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to save diagnostic progress');
      return { success: false, message: 'Could not save progress.' };
    }
  }

  async complete(input: DiagnosticCompleteInput): Promise<DiagnosticSubmitResult> {
    const { diagnosticSubmissions } = this.database.schema;

    // Recomputed server-side — the stored row is never a copy of client-side
    // scoring, only the client's instant (network-independent) reveal is.
    const result = evaluateDiagnostic(input.answers);
    const emailIsFreeProvider = input.email ? isFreeEmailProvider(input.email) : false;

    try {
      const row = {
        sessionId: input.sessionId,
        answers: input.answers,
        initiativeText: input.answers.A1?.value ?? null,
        duration: input.answers.A2?.value ?? null,
        commitment: input.answers.A3?.value ?? null,
        stillDelivering: input.answers.A4?.value ?? null,
        pillarScores: {
          organisation: result.pillars.organisation.score,
          team: result.pillars.team.score,
          self: result.pillars.self.score,
        },
        pillarBands: {
          organisation: result.pillars.organisation.band,
          team: result.pillars.team.band,
          self: result.pillars.self.band,
        },
        archetype: result.archetype,
        mirrorsFired: result.mirrorsFired,
        recommendationsShown: result.recommendations.map((r) => r.id),
        role: input.role,
        companySize: input.companySize,
        sector: input.sector,
        email: input.email ?? null,
        emailIsFreeProvider,
        referrer: input.referrer ?? null,
        utm: input.utm ?? {},
        durationSeconds: input.durationSeconds,
        device: input.device,
      };

      await this.database.db
        .insert(diagnosticSubmissions)
        .values({ ...row, completedAt: sql`now()` })
        .onConflictDoUpdate({
          target: diagnosticSubmissions.sessionId,
          set: { ...row, completedAt: sql`now()`, updatedAt: sql`now()` },
        });

      this.fireWebhook({
        ...row,
        sessionId: input.sessionId,
        completedAt: new Date().toISOString(),
      });

      if (input.email) {
        await this.sendReadingEmail(input.email, result);
      }

      return {
        success: true,
        message: "Thanks. We'll put a copy in your inbox if you asked for one.",
      };
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to complete diagnostic submission');
      return { success: false, message: 'Could not save your reading. Please try again.' };
    }
  }

  /** The "Email me this reading" secondary action, for a run completed without an email. */
  async emailReading(sessionId: string, email: string): Promise<DiagnosticSubmitResult> {
    const { diagnosticSubmissions } = this.database.schema;
    const { eq } = await import('drizzle-orm');

    const [row] = await this.database.db
      .select()
      .from(diagnosticSubmissions)
      .where(eq(diagnosticSubmissions.sessionId, sessionId))
      .limit(1);

    if (!row?.completedAt) {
      return { success: false, message: 'No completed reading found for this session.' };
    }

    const result = evaluateDiagnostic(row.answers);
    const emailIsFreeProvider = isFreeEmailProvider(email);

    await this.database.db
      .update(diagnosticSubmissions)
      .set({ email, emailIsFreeProvider, updatedAt: sql`now()` })
      .where(eq(diagnosticSubmissions.sessionId, sessionId));

    await this.sendReadingEmail(email, result);
    return { success: true, message: "We've sent a copy to your inbox." };
  }

  private async sendReadingEmail(email: string, result: RevealResult): Promise<void> {
    const message: EmailWorkItem = {
      to: email,
      subject: `Your initiative blind spot reading: ${result.headline}`,
      html: this.buildReadingEmailHtml(result),
      enqueuedAt: new Date().toISOString(),
    };

    try {
      await this.queueService.send(QUEUE_NAMES.NOTIFICATION, message);
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to enqueue diagnostic reading email');
    }
  }

  private buildReadingEmailHtml(result: RevealResult): string {
    const pillarRowsHtml = (['organisation', 'team', 'self'] as const)
      .map((pillar) => {
        const pillarResult = result.pillars[pillar];
        return `
          <tr>
            <td style="padding: 6px 12px 6px 0; color: #6b7280; font-size: 14px; vertical-align: top; white-space: nowrap;">${escapeHtml(PILLAR_LABEL[pillar])}</td>
            <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 500;">${escapeHtml(BAND_LABEL[pillarResult.band])}: ${escapeHtml(BAND_READING[pillarResult.band])}</td>
          </tr>`;
      })
      .join('');

    const mirrorsHtml = result.mirrorsShown
      .map(
        (mirror) =>
          `<p style="margin: 0 0 16px 0; color: #111827; font-size: 15px; line-height: 1.6;">${escapeHtml(mirror.text)}</p>`
      )
      .join('');

    const recommendationsHtml = result.recommendations
      .map(
        (rec) => `
          <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(rec.title)} <span style="color: #6b7280; font-weight: 400;">(${escapeHtml(rec.effort)})</span></p>
          <p style="margin: 0 0 14px 0; color: #374151; font-size: 14px; line-height: 1.6;">${escapeHtml(rec.body)}</p>`
      )
      .join('');

    const bodyHtml = `
      <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">On &ldquo;${escapeHtml(result.initiativeText)}&rdquo;</p>
      <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #111;">${escapeHtml(result.headline)}</p>
      ${renderAccentBlock({
        accent: 'neutral',
        innerHtml: `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%;"><tbody>${pillarRowsHtml}</tbody></table>`,
      })}
      <div style="margin: 20px 0;">${mirrorsHtml}</div>
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">What you can do this week</p>
      ${recommendationsHtml}
      <p style="margin: 20px 0 0 0; font-weight: 600;">${escapeHtml(DIAGNOSTIC_COPY.askHeading)}</p>
      <p style="margin: 4px 0 0 0; color: #374151;">${escapeHtml(DIAGNOSTIC_COPY.askBody)}</p>
    `;

    return renderEmailShell({
      title: result.headline,
      bodyHtml,
      footnote: DIAGNOSTIC_COPY.privacyLine,
    });
  }

  /** Fire-and-forget POST of the full completed row. Never blocks or fails the response. */
  private fireWebhook(payload: Record<string, unknown>): void {
    const url = this.config.diagnosticWebhookUrl;
    if (!url) return;

    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((error) => {
      this.logger.warn({ err: error }, 'Diagnostic webhook POST failed');
    });
  }
}
