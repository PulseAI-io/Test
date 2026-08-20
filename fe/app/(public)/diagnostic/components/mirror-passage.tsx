import type { MirrorPassage } from '@pulse/shared/diagnostic';

/** The visual and emotional centre of the reveal (§7) — given the most space and the strongest treatment. */
export function MirrorPassageBlock({ passage }: { passage: MirrorPassage }) {
  return (
    <p className="diag-question border-l-2 border-[var(--teal)] pl-5 text-lg leading-relaxed text-[var(--ink)] sm:text-xl">
      {passage.text}
    </p>
  );
}
