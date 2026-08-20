import type { Recommendation } from '@pulse/shared/diagnostic';

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-5">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-[var(--ink)]">{recommendation.title}</h3>
        <span className="diag-mono shrink-0 rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[11px] uppercase tracking-[0.04em] text-[var(--teal)]">
          {recommendation.effort}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[color:var(--ink2)]">{recommendation.body}</p>
    </div>
  );
}
