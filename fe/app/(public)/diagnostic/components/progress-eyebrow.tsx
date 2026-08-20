import { PILLAR_LABEL } from '@pulse/shared/diagnostic';

interface ProgressEyebrowProps {
  pillarPosition: {
    pillar: 'organisation' | 'team' | 'self';
    position: number;
    total: number;
  } | null;
  fallbackLabel: string;
}

/** No progress percentage (§3) — a named pillar position instead, e.g. "Organisation · 3 of 5". */
export function ProgressEyebrow({ pillarPosition, fallbackLabel }: ProgressEyebrowProps) {
  const text = pillarPosition
    ? `${PILLAR_LABEL[pillarPosition.pillar]} · ${pillarPosition.position} of ${pillarPosition.total}`
    : fallbackLabel;

  return (
    <p
      className="diag-mono text-xs uppercase tracking-[0.08em] text-[color:var(--mut)]"
      aria-live="polite"
    >
      {text}
    </p>
  );
}
