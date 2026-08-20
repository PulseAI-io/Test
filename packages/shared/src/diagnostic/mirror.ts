import { shownScoredQuestions } from './questions';
import { scoreAllPillars } from './scoring';
import type { AnswerMap } from './types';
import { answerValue } from './types';

export type MirrorId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9';

interface MirrorRule {
  id: MirrorId;
  priority: number;
  test: (answers: AnswerMap) => boolean;
  text: string;
}

const MIRROR_RULES: MirrorRule[] = [
  {
    id: 'M1',
    priority: 1,
    test: (a) =>
      answerValue(a, 'Q11') === 'yes' &&
      (answerValue(a, 'Q12') === 'held-waiting-for-proof' ||
        answerValue(a, 'Q13') === 'learned-to-wait-for-proof'),
    text:
      'You already suspected this had stopped being worth it. You did not raise it, and the reason is not nerve. Raising a concern without evidence attached costs you credibility, so you waited for something you could point at. That wait is not caution. It is the gap between knowing and being able to prove it, and every week inside that gap is spent on an initiative you had already doubted.',
  },
  {
    id: 'M2',
    priority: 2,
    test: (a) => answerValue(a, 'A4') === 'yes' && answerValue(a, 'Q14') === 'mostly-assumption',
    text:
      'You told us this is still expected to deliver what it promised. You also told us that confidence rests mostly on nothing having changed since you last looked. Both of those can be true. Only one of them is evidence.',
  },
  {
    id: 'M3',
    priority: 3,
    test: (a) => answerValue(a, 'Q3') === 'nobody' && answerValue(a, 'Q5') === 'from-outside-after-fact',
    text:
      'Nobody is responsible for checking whether the conditions behind this still hold, and if they stopped holding, you would find out from outside the building. That is not a reporting gap. It means the decision to continue is being made for you, by whoever notices first.',
  },
  {
    id: 'M4',
    priority: 4,
    test: (a) =>
      answerValue(a, 'Q7') === 'card-moved-field-updated' && answerValue(a, 'Q9') === 'most-of-it-myself',
    text:
      'Green means someone updated a field. So you go and find the truth yourself, initiative by initiative, conversation by conversation. That is not you being close to the detail. It is you doing the work your reporting was supposed to do, and it does not scale past the number of conversations you can have in a week.',
  },
  {
    id: 'M5',
    priority: 5,
    test: (a) =>
      answerValue(a, 'Q1') === 'deadline-budget-only' &&
      answerValue(a, 'Q15') === 'would-not-know-where-to-start',
    text:
      'The conditions this depended on were never written down, so if you wanted to argue tomorrow that it should stop, you would be starting from nothing. The case for continuing gets made by default every day, because it is the only case anyone can assemble quickly.',
  },
  {
    id: 'M6',
    priority: 6,
    test: (a) => answerValue(a, 'A2') === 'over-12-months' && answerValue(a, 'Q4') === 'nothing',
    text:
      'This has been running over a year, and nothing connects a change in the outside world back to it. It is still being delivered against the reasoning that justified it a year ago, whether or not that reasoning survived the year.',
  },
  {
    id: 'M7',
    priority: 7,
    test: (a) =>
      answerValue(a, 'Q8') === 'logged-rarely-looked-at-again' && answerValue(a, 'Q10') === 'not-confident',
    text:
      'Concerns get logged and then left, and you are not confident problems reach you early. Those two facts are the same fact. People stop raising things when raising them changes nothing, so the log fills up while the signal goes quiet.',
  },
  {
    id: 'M8',
    priority: 8,
    test: (a) => answerValue(a, 'Q2') === 'lost-to-memory' && answerValue(a, 'Q3') !== 'named-owner',
    text:
      'Why this was approved now lives in memory rather than in a record, and nobody owns keeping it current. Every month that passes makes the original reasoning harder to recover, and harder to test against what is actually happening.',
  },
  {
    id: 'M9',
    priority: 9,
    test: (a) => {
      const bands = scoreAllPillars(a);
      return (
        bands.organisation.band === 'sighted' &&
        bands.team.band === 'sighted' &&
        bands.self.band === 'sighted' &&
        answerValue(a, 'Q11') === 'yes'
      );
    },
    text:
      'Your reporting holds up and the checks exist. You still had the thought that this might have stopped being worth it, and you had it before anything in the system did. Good instrumentation tells you how the work is going. It does not tell you whether the work should continue.',
  },
];

export interface MirrorPassage {
  id: MirrorId | 'fallback';
  text: string;
}

/** Every mirror rule's copy, for the copy-lint check. */
export function allMirrorTexts(): Array<{ id: MirrorId; text: string }> {
  return MIRROR_RULES.map((rule) => ({ id: rule.id, text: rule.text }));
}

/** All mirror rules that fire for this answer set, in priority order. */
export function evaluateMirrors(answers: AnswerMap): MirrorId[] {
  return MIRROR_RULES.filter((rule) => rule.test(answers))
    .sort((a, b) => a.priority - b.priority)
    .map((rule) => rule.id);
}

function fallbackLines(answers: AnswerMap, count: number): MirrorPassage[] {
  const bands = scoreAllPillars(answers);
  const pillarsByScore = (['organisation', 'team', 'self'] as const)
    .map((pillar) => bands[pillar])
    .sort((a, b) => a.score - b.score);

  const lines: MirrorPassage[] = [];
  const usedQuestionIds = new Set<string>();

  for (const pillarResult of pillarsByScore) {
    if (lines.length >= count) break;
    const questionsInPillar = shownScoredQuestions(answers).filter((q) => q.pillar === pillarResult.pillar);
    if (questionsInPillar.length === 0) continue;
    const lowest = questionsInPillar
      .filter((q) => !usedQuestionIds.has(q.id))
      .sort((a, b) => (answers[a.id]?.points ?? 0) - (answers[b.id]?.points ?? 0))[0];
    if (!lowest) continue;
    usedQuestionIds.add(lowest.id);
    const chosenOption = lowest.options.find((o) => o.id === answerValue(answers, lowest.id));
    lines.push({
      id: 'fallback',
      text: `On ${lowest.shortLabel}, your answer was "${chosenOption?.label ?? ''}". That is where the sightline is thinnest.`,
    });
  }

  return lines;
}

/** The up-to-three mirror passages shown on the reveal, with fallback per §7.2. */
export function selectShownMirrors(answers: AnswerMap): MirrorPassage[] {
  const fired = evaluateMirrors(answers);

  if (fired.length >= 2) {
    return fired
      .slice(0, 3)
      .map((id) => ({ id, text: MIRROR_RULES.find((r) => r.id === id)?.text ?? '' }));
  }

  const [firstId] = fired;
  if (firstId) {
    const rule = MIRROR_RULES.find((r) => r.id === firstId);
    return [{ id: firstId, text: rule?.text ?? '' }, ...fallbackLines(answers, 1)];
  }

  return fallbackLines(answers, 2);
}
