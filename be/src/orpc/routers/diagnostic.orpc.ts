import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { orpcContract } from '@pulse/shared/orpc';
import { firstForwardedIp } from '@/common/utils/request-ip';
import { DiagnosticService } from '@/modules/organization/diagnostic/diagnostic.service';
import { DiagnosticRateLimiterService } from '@/modules/organization/diagnostic/diagnostic-rate-limiter.service';
import type { AppContextResult } from '@/orpc/orpc.types';
import type { DomainOrpcRouter } from '../domain-router';

function extractIp(ctx: AppContextResult): string {
  const req = ctx.req as { ip?: string; headers?: Record<string, string | string[] | undefined> };
  return firstForwardedIp(req?.headers, req?.ip);
}

/**
 * Initiative Blind Spot Diagnostic — fully public, no RBAC gate, only an
 * IP-based rate limit. Mirrors `ContactOrpcController`.
 */
@Controller()
export class DiagnosticOrpcController implements DomainOrpcRouter {
  readonly key = 'diagnostic';

  constructor(
    private readonly diagnosticService: DiagnosticService,
    private readonly rateLimiter: DiagnosticRateLimiterService
  ) {}

  private handlers() {
    return {
      saveProgress: implement(orpcContract.diagnostic.saveProgress).handler(
        async ({ input, context }) => {
          this.rateLimiter.enforceSaveProgress(extractIp(context));
          return this.diagnosticService.saveProgress(input);
        }
      ),
      complete: implement(orpcContract.diagnostic.complete).handler(async ({ input, context }) => {
        this.rateLimiter.enforceComplete(extractIp(context));
        return this.diagnosticService.complete(input);
      }),
      emailReading: implement(orpcContract.diagnostic.emailReading).handler(
        async ({ input, context }) => {
          this.rateLimiter.enforceComplete(extractIp(context));
          return this.diagnosticService.emailReading(input.sessionId, input.email);
        }
      ),
    };
  }

  @Implement(orpcContract.diagnostic)
  diagnostic() {
    return this.handlers();
  }

  build() {
    return this.handlers();
  }
}
