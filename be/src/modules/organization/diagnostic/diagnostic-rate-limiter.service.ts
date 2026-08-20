import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  DIAGNOSTIC_COMPLETE_MAX_REQUESTS,
  DIAGNOSTIC_COMPLETE_WINDOW_MS,
  DIAGNOSTIC_MAX_ENTRIES,
  DIAGNOSTIC_SAVE_MAX_REQUESTS,
  DIAGNOSTIC_SAVE_WINDOW_MS,
} from './diagnostic.constants';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

/**
 * In-memory IP-based rate limiter for the public diagnostic endpoints.
 * Same memory-local caveat as `ContactRateLimiterService`: per-process, fine
 * for a low-volume public tool, swap for Redis if that stops being true.
 */
@Injectable()
export class DiagnosticRateLimiterService {
  private readonly logger = new Logger(DiagnosticRateLimiterService.name);
  private readonly saveBuckets = new Map<string, RateLimitEntry>();
  private readonly completeBuckets = new Map<string, RateLimitEntry>();

  enforceSaveProgress(ip: string): void {
    this.enforce(this.saveBuckets, ip, DIAGNOSTIC_SAVE_WINDOW_MS, DIAGNOSTIC_SAVE_MAX_REQUESTS);
  }

  enforceComplete(ip: string): void {
    this.enforce(
      this.completeBuckets,
      ip,
      DIAGNOSTIC_COMPLETE_WINDOW_MS,
      DIAGNOSTIC_COMPLETE_MAX_REQUESTS
    );
  }

  private enforce(
    buckets: Map<string, RateLimitEntry>,
    ip: string,
    windowMs: number,
    max: number
  ): void {
    const now = Date.now();
    const entry = buckets.get(ip);

    if (!entry || now - entry.windowStart >= windowMs) {
      buckets.set(ip, { count: 1, windowStart: now });
      this.gc(buckets, now, windowMs);
      return;
    }

    entry.count += 1;
    if (entry.count > max) {
      this.logger.warn({ ip }, 'diagnostic rate limit exceeded');
      throw new HttpException(
        'Too many requests. Please wait a minute before trying again.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
  }

  private gc(buckets: Map<string, RateLimitEntry>, now: number, windowMs: number): void {
    if (buckets.size <= DIAGNOSTIC_MAX_ENTRIES) return;
    for (const [ip, e] of buckets) {
      if (now - e.windowStart >= windowMs) buckets.delete(ip);
    }
  }
}
