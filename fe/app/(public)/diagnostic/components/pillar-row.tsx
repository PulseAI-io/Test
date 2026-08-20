import type { PillarResult } from '@pulse/shared/diagnostic';
import { BAND_LABEL, BAND_READING, PILLAR_LABEL } from '@pulse/shared/diagnostic';

export function PillarRow({ result }: { result: PillarResult }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3">
      <div className="flex items-baseline gap-3">
        <span className="diag-mono text-xs uppercase tracking-[0.06em] text-[color:var(--mut)]">
          {PILLAR_LABEL[result.pillar]}
        </span>
        <span
          className="diag-mono text-xs font-medium uppercase tracking-[0.04em]"
          style={{
            color:
              result.band === 'blind'
                ? 'var(--red)'
                : result.band === 'partial'
                  ? 'var(--amb)'
                  : 'var(--teal)',
          }}
        >
          {BAND_LABEL[result.band]}
        </span>
      </div>
      <p className="text-right text-sm text-[color:var(--ink2)]">{BAND_READING[result.band]}</p>
    </div>
  );
}
