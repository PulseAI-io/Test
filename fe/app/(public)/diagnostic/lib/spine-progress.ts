import type { AnswerMap, Question } from '@pulse/shared/diagnostic';
import { ALL_QUESTIONS, isQuestionShown } from '@pulse/shared/diagnostic';
import type { ScreenId } from './use-diagnostic-state';

type Group = 'anchor' | 'organisation' | 'team' | 'self' | 'capture';

function groupOf(item: Question | 'capture'): Group {
  if (item === 'capture') return 'capture';
  return item.kind === 'scored' ? item.pillar : 'anchor';
}

function orderedItems(answers: AnswerMap): Array<Question | 'capture'> {
  const questions = ALL_QUESTIONS.filter((q) => isQuestionShown(q, answers));
  return [...questions, 'capture' as const];
}

/** Fractional positions (0..1) where a new pillar begins, for the spine's node markers. */
export function computeBoundaries(answers: AnswerMap): number[] {
  const items = orderedItems(answers);
  const boundaries: number[] = [];
  for (let i = 1; i < items.length; i++) {
    if (groupOf(items[i]) !== groupOf(items[i - 1]) && groupOf(items[i]) !== 'capture') {
      boundaries.push(i / items.length);
    }
  }
  return boundaries;
}

/** How far down the spine should be drawn (0..1) for the current screen. */
export function computeProgress(currentScreen: ScreenId, answers: AnswerMap): number {
  const items = orderedItems(answers);
  if (currentScreen === 'reveal') return 1;
  const index = items.findIndex((item) =>
    item === 'capture' ? currentScreen === 'capture' : item.id === currentScreen
  );
  const safeIndex = index === -1 ? 0 : index;
  return (safeIndex + 1) / items.length;
}
