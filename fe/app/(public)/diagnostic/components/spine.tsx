'use client';

/**
 * The signature element (§11): a single vertical line down the left of every
 * screen, drawing downward with progress, with a node at each pillar
 * boundary. Purely decorative — aria-hidden, and the real progress /
 * position is announced separately via the eyebrow's live region.
 */
export function Spine({
  progressFraction,
  boundaries,
}: {
  progressFraction: number;
  boundaries: number[];
}) {
  const clamped = Math.max(0, Math.min(1, progressFraction));

  return (
    <div className="relative h-full w-6 shrink-0 sm:w-8" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 24 100"
        preserveAspectRatio="none"
        role="presentation"
      >
        <line x1="12" y1="0" x2="12" y2="100" stroke="var(--line)" strokeWidth="2" />
        <line
          className="diag-spine-path"
          x1="12"
          y1="0"
          x2="12"
          y2="100"
          stroke="var(--teal)"
          strokeWidth="2"
          strokeDasharray="100"
          strokeDashoffset={100 - clamped * 100}
        />
        {boundaries.map((fraction) => (
          <circle
            key={fraction}
            cx="12"
            cy={fraction * 100}
            r="3.5"
            fill="var(--cream)"
            stroke="var(--teal)"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}

/** The reveal's one-time rendering: a break in each pillar segment scored Structurally blind. */
export function RevealSpine({ blindSegments }: { blindSegments: [boolean, boolean, boolean] }) {
  const segments = [0, 1, 2].map((i) => ({
    start: (i / 3) * 100,
    end: ((i + 1) / 3) * 100,
    blind: blindSegments[i],
  }));

  return (
    <div className="relative h-full w-6 shrink-0 sm:w-8" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 24 100"
        preserveAspectRatio="none"
        role="presentation"
      >
        {segments.map((seg) => {
          if (!seg.blind) {
            return (
              <line
                key={seg.start}
                x1="12"
                y1={seg.start}
                x2="12"
                y2={seg.end}
                stroke="var(--teal)"
                strokeWidth="2"
              />
            );
          }
          const mid = (seg.start + seg.end) / 2;
          const gap = 6;
          return (
            <g key={seg.start}>
              <line
                x1="12"
                y1={seg.start}
                x2="12"
                y2={mid - gap}
                stroke="var(--teal)"
                strokeWidth="2"
              />
              <line
                x1="12"
                y1={mid + gap}
                x2="12"
                y2={seg.end}
                stroke="var(--teal)"
                strokeWidth="2"
              />
              <line
                x1="8"
                y1={mid - gap}
                x2="16"
                y2={mid + gap}
                stroke="var(--red)"
                strokeWidth="2"
              />
              <line
                x1="16"
                y1={mid - gap}
                x2="8"
                y2={mid + gap}
                stroke="var(--red)"
                strokeWidth="2"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
