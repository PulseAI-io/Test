'use client';

import type { Option } from '@pulse/shared/diagnostic';
import { useCallback, useRef } from 'react';

interface OptionListProps {
  legend: string;
  options: Option[];
  selectedId?: string;
  onSelect: (optionId: string) => void;
}

/** Forced-choice options as a keyboard-operable radiogroup. Selecting advances immediately — no separate "next" tap. */
export function OptionList({ legend, options, selectedId, onSelect }: OptionListProps) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusIndex = useCallback(
    (index: number) => {
      const clamped = (index + options.length) % options.length;
      itemRefs.current[clamped]?.focus();
    },
    [options.length]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        focusIndex(index + 1);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        focusIndex(index - 1);
      }
    },
    [focusIndex]
  );

  return (
    <div role="radiogroup" aria-label={legend} className="flex flex-col gap-3">
      {options.map((option, index) => {
        const checked = option.id === selectedId;
        return (
          // biome-ignore lint/a11y/useSemanticElements: custom-styled forced-choice card, not a native radio circle; role+aria-checked+arrow-key roving focus follows the WAI-ARIA APG radio group pattern.
          <button
            key={option.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onSelect(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`diag-sans min-h-12 w-full rounded-xl border px-5 py-3 text-left text-base transition-colors
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
              ${
                checked
                  ? 'border-[var(--teal)] bg-[var(--tint)] text-[var(--ink)]'
                  : 'border-[var(--line)] bg-[var(--card)] text-[var(--ink2)] hover:border-[var(--tintb)] hover:bg-[var(--tint)]'
              }`}
            style={{ outlineColor: 'var(--teal)' }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
