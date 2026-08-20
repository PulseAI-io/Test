import { Module } from '@nestjs/common';
import { DiagnosticService } from './diagnostic.service';
import { DiagnosticRateLimiterService } from './diagnostic-rate-limiter.service';

@Module({
  providers: [DiagnosticService, DiagnosticRateLimiterService],
  exports: [DiagnosticService, DiagnosticRateLimiterService],
})
export class DiagnosticModule {}
