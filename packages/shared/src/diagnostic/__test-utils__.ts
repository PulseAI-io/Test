import { SCORED_QUESTIONS } from './questions';
import type { AnswerMap, QuestionId, ScoredQuestionId } from './types';

/** Builds an AnswerMap from {questionId: optionId} pairs, looking up points for scored questions. */
export function buildAnswers(
  raw: Partial<Record<QuestionId, string>>
): AnswerMap {
  const answers: AnswerMap = {};
  for (const [id, optionId] of Object.entries(raw) as [QuestionId, string][]) {
    const question = SCORED_QUESTIONS.find((q) => q.id === id);
    if (question) {
      const option = question.options.find((o) => o.id === optionId);
      answers[id] = { value: optionId, points: option?.points };
    } else {
      answers[id] = { value: optionId };
    }
  }
  return answers;
}

/** A fully-answered "all sighted" baseline (every scored question at max points, Q11 = no so Q12 is skipped). */
export function allSightedAnswers(): AnswerMap {
  const raw: Partial<Record<ScoredQuestionId, string>> = {
    Q1: 'documented',
    Q2: 'recorded',
    Q3: 'named-owner',
    Q4: 'defined-process',
    Q5: 'something-would-surface',
    Q6: 'both-schedule-and-worth',
    Q7: 'real-outcome-verified',
    Q8: 'tracked-to-resolution',
    Q9: 'little-reporting-holds-up',
    Q10: 'confident',
    Q11: 'no',
    Q13: 'taken-seriously',
    Q14: 'mostly-recent-evidence',
    Q15: 'could-make-case-now',
  };
  return buildAnswers(raw);
}

/** A fully-answered "all blind" baseline. Q11='yes' triggers Q12. */
export function allBlindAnswers(): AnswerMap {
  const raw: Partial<Record<ScoredQuestionId, string>> = {
    Q1: 'deadline-budget-only',
    Q2: 'lost-to-memory',
    Q3: 'nobody',
    Q4: 'nothing',
    Q5: 'from-outside-after-fact',
    Q6: 'activity-and-effort',
    Q7: 'not-sure',
    Q8: 'logged-rarely-looked-at-again',
    Q9: 'most-of-it-myself',
    Q10: 'not-confident',
    Q11: 'yes',
    Q12: 'held-waiting-for-proof',
    Q13: 'learned-to-wait-for-proof',
    Q14: 'mostly-assumption',
    Q15: 'would-not-know-where-to-start',
  };
  return buildAnswers(raw);
}
