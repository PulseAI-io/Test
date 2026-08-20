import type { AnchorSelectQuestion, AnswerMap, FreeTextQuestion, Question, ScoredQuestion } from './types';
import { answerValue } from './types';

export const ANCHOR_A1: FreeTextQuestion = {
  kind: 'text',
  id: 'A1',
  prompt: 'Bring one real initiative to mind. Something you are accountable for right now, with your name on it. What is it, in a sentence?',
  helper: 'Everything that follows is about this one thing. Be specific.',
  maxLength: 140,
};

export const ANCHOR_A2: AnchorSelectQuestion = {
  kind: 'anchor-select',
  id: 'A2',
  prompt: 'How long has it been running?',
  options: [
    { id: 'under-3-months', label: 'Under 3 months' },
    { id: '3-to-6-months', label: '3 to 6 months' },
    { id: '6-to-12-months', label: '6 to 12 months' },
    { id: 'over-12-months', label: 'Over 12 months' },
  ],
};

export const ANCHOR_A3: AnchorSelectQuestion = {
  kind: 'anchor-select',
  id: 'A3',
  prompt: 'Roughly what is committed to it?',
  options: [
    { id: 'under-100k-or-1-2-people', label: 'Under £100k or 1 to 2 people' },
    { id: '100k-to-500k-or-small-team', label: '£100k to £500k, or a small team' },
    { id: '500k-to-2m-or-several-teams', label: '£500k to £2m, or several teams' },
    { id: 'over-2m-or-programme', label: 'Over £2m, or a programme' },
    { id: 'rather-not-say', label: 'I would rather not say' },
  ],
};

export const ANCHOR_A4: AnchorSelectQuestion = {
  kind: 'anchor-select',
  id: 'A4',
  prompt: 'Is it still expected to deliver what it originally promised?',
  options: [
    { id: 'yes', label: 'Yes' },
    { id: 'partly', label: 'Partly' },
    { id: 'unclear', label: 'Honestly, unclear' },
  ],
};

const ORG_EYEBROW = 'Does the organisation know whether this still makes sense, or only whether it is on time?';
const TEAM_EYEBROW = 'Does delivery reporting tell you the truth, or just tell you it is green?';
const SELF_EYEBROW = 'What did you already know, and what happened to it?';

export const Q1: ScoredQuestion = {
  kind: 'scored',
  id: 'Q1',
  pillar: 'organisation',
  eyebrow: ORG_EYEBROW,
  prompt:
    'When this was approved, were the conditions it depended on written down alongside the decision? Cost holding, a timeline, a market staying put, a competitor not moving, a dependency landing.',
  shortLabel: 'whether the founding conditions were written down',
  options: [
    { id: 'documented', label: 'Explicit and documented', points: 2 },
    { id: 'understood-undocumented', label: 'Understood at the time, never written down', points: 1 },
    { id: 'deadline-budget-only', label: 'Just a deadline and a budget', points: 0 },
  ],
};

export const Q2: ScoredQuestion = {
  kind: 'scored',
  id: 'Q2',
  pillar: 'organisation',
  eyebrow: ORG_EYEBROW,
  prompt: 'Could you, today, reconstruct why this was approved without asking anyone?',
  shortLabel: 'whether you could reconstruct why this was approved',
  options: [
    { id: 'recorded', label: 'Yes, it is recorded', points: 2 },
    { id: 'reconstructing', label: 'Partly, I would be reconstructing it', points: 1 },
    { id: 'lost-to-memory', label: 'No, that reasoning left with people or memory', points: 0 },
  ],
};

export const Q3: ScoredQuestion = {
  kind: 'scored',
  id: 'Q3',
  pillar: 'organisation',
  eyebrow: ORG_EYEBROW,
  prompt:
    'Since it started, who has been responsible for checking whether those founding conditions still hold?',
  shortLabel: 'who checks whether the founding conditions still hold',
  options: [
    { id: 'named-owner', label: 'A named owner, as part of their role', points: 2 },
    { id: 'probably-flag', label: 'Nobody formally, but someone would probably flag it', points: 1 },
    { id: 'nobody', label: 'Nobody', points: 0 },
  ],
};

export const Q4: ScoredQuestion = {
  kind: 'scored',
  id: 'Q4',
  pillar: 'organisation',
  eyebrow: ORG_EYEBROW,
  prompt:
    'When something material changes outside the initiative, a competitor moves, a cost shifts, a regulation lands, what connects that event back to this?',
  shortLabel: 'what connects outside change back to this',
  options: [
    { id: 'defined-process', label: 'A defined process', points: 2 },
    { id: 'someone-might-link', label: 'Someone might make the link', points: 1 },
    { id: 'nothing', label: 'Nothing', points: 0 },
  ],
};

export const Q5: ScoredQuestion = {
  kind: 'scored',
  id: 'Q5',
  pillar: 'organisation',
  eyebrow: ORG_EYEBROW,
  prompt: 'If this stopped being worth finishing tomorrow, how would the organisation find out?',
  shortLabel: 'how the organisation would learn this had stopped being worth finishing',
  options: [
    { id: 'something-would-surface', label: 'Something in place would surface it', points: 2 },
    { id: 'someone-would-notice', label: 'Someone would eventually notice and raise it', points: 1 },
    { id: 'from-outside-after-fact', label: 'From a customer, a competitor or the board, after the fact', points: 0 },
  ],
};

export const Q6: ScoredQuestion = {
  kind: 'scored',
  id: 'Q6',
  pillar: 'team',
  eyebrow: TEAM_EYEBROW,
  prompt: 'What does your status reporting actually answer?',
  shortLabel: 'what your status reporting actually answers',
  options: [
    {
      id: 'both-schedule-and-worth',
      label: 'Both whether it is on schedule and whether it is still worth finishing',
      points: 2,
    },
    { id: 'schedule-only', label: 'Whether it is on schedule', points: 1 },
    { id: 'activity-and-effort', label: 'Activity and effort, mostly', points: 0 },
  ],
};

export const Q7: ScoredQuestion = {
  kind: 'scored',
  id: 'Q7',
  pillar: 'team',
  eyebrow: TEAM_EYEBROW,
  prompt: 'When a status turns green, what has been verified?',
  shortLabel: 'what a green status has actually verified',
  options: [
    { id: 'real-outcome-verified', label: 'A real outcome was completed', points: 2 },
    { id: 'card-moved-field-updated', label: 'Someone moved a card or updated a field', points: 1 },
    { id: 'not-sure', label: 'I am not sure', points: 0 },
  ],
};

export const Q8: ScoredQuestion = {
  kind: 'scored',
  id: 'Q8',
  pillar: 'team',
  eyebrow: TEAM_EYEBROW,
  prompt: 'When someone raises a risk or a concern, what happens to it?',
  shortLabel: 'what happens to a raised risk or concern',
  options: [
    { id: 'tracked-to-resolution', label: 'Tracked until it is resolved or closed out', points: 2 },
    { id: 'logged-reviewed-occasionally', label: 'Logged, and reviewed occasionally', points: 1 },
    { id: 'logged-rarely-looked-at-again', label: 'Logged, and rarely looked at again', points: 0 },
  ],
};

export const Q9: ScoredQuestion = {
  kind: 'scored',
  id: 'Q9',
  pillar: 'team',
  eyebrow: TEAM_EYEBROW,
  prompt:
    'How much of what you know about progress comes from asking people directly, rather than from what is reported?',
  shortLabel: 'how much of your progress picture comes from asking people directly',
  options: [
    { id: 'little-reporting-holds-up', label: 'Little, the reporting holds up', points: 2 },
    { id: 'fair-amount', label: 'A fair amount', points: 1 },
    { id: 'most-of-it-myself', label: 'Most of it, I go and find it myself', points: 0 },
  ],
};

export const Q10: ScoredQuestion = {
  kind: 'scored',
  id: 'Q10',
  pillar: 'team',
  eyebrow: TEAM_EYEBROW,
  prompt:
    'How confident are you the team would raise a problem the moment it appeared, rather than once it was unavoidable?',
  shortLabel: 'whether the team would raise a problem the moment it appeared',
  options: [
    { id: 'confident', label: 'Confident', points: 2 },
    { id: 'somewhat', label: 'Somewhat', points: 1 },
    { id: 'not-confident', label: 'Not confident', points: 0 },
  ],
};

export const Q11: ScoredQuestion = {
  kind: 'scored',
  id: 'Q11',
  pillar: 'self',
  eyebrow: SELF_EYEBROW,
  prompt:
    'In the last few months, have you suspected, before you could prove it, that this had quietly stopped being worth it?',
  helper: 'There is no wrong answer here. Most people who run initiatives have had this thought at least once.',
  shortLabel: 'whether you have suspected this had quietly stopped being worth it',
  options: [
    { id: 'no', label: 'No', points: 2 },
    { id: 'wondered-not-seriously', label: 'I have wondered, not seriously', points: 1 },
    { id: 'yes', label: 'Yes', points: 0 },
  ],
};

export const Q12: ScoredQuestion = {
  kind: 'scored',
  id: 'Q12',
  pillar: 'self',
  eyebrow: SELF_EYEBROW,
  prompt: 'What happened to that thought?',
  shortLabel: 'what happened to that suspicion',
  showIf: (answers: AnswerMap) => {
    const q11 = answerValue(answers, 'Q11');
    return q11 === 'yes' || q11 === 'wondered-not-seriously';
  },
  options: [
    { id: 'raised-and-acted-on', label: 'I raised it and it was acted on', points: 2 },
    { id: 'raised-and-went-nowhere', label: 'I raised it and it went nowhere', points: 1 },
    { id: 'held-waiting-for-proof', label: 'I held it, waiting for something I could point at', points: 0 },
  ],
};

export const Q13: ScoredQuestion = {
  kind: 'scored',
  id: 'Q13',
  pillar: 'self',
  eyebrow: SELF_EYEBROW,
  prompt: 'When you raise something early, before you have hard evidence, what usually happens?',
  shortLabel: 'what happens when you raise something early, without proof',
  options: [
    { id: 'taken-seriously', label: 'It is taken seriously', points: 2 },
    { id: 'parked-until-proof', label: 'It is parked until there is proof', points: 1 },
    { id: 'learned-to-wait-for-proof', label: 'I have learned to wait until I have proof', points: 0 },
  ],
};

export const Q14: ScoredQuestion = {
  kind: 'scored',
  id: 'Q14',
  pillar: 'self',
  eyebrow: SELF_EYEBROW,
  prompt:
    'How much of your confidence in this right now is evidence you have seen recently, versus the assumption that nothing has changed since you last looked?',
  shortLabel: 'how much of your confidence is recent evidence versus assumption',
  options: [
    { id: 'mostly-recent-evidence', label: 'Mostly recent evidence', points: 2 },
    { id: 'a-mix', label: 'A mix', points: 1 },
    { id: 'mostly-assumption', label: 'Mostly assumption', points: 0 },
  ],
};

export const Q15: ScoredQuestion = {
  kind: 'scored',
  id: 'Q15',
  pillar: 'self',
  eyebrow: SELF_EYEBROW,
  prompt: 'If you had to make the case tomorrow that this should stop, how long would it take you to assemble it?',
  shortLabel: 'how long it would take to make the case that this should stop',
  options: [
    { id: 'could-make-case-now', label: 'I could make it now', points: 2 },
    { id: 'days-of-digging', label: 'Days of digging', points: 1 },
    { id: 'would-not-know-where-to-start', label: 'I would not know where to start', points: 0 },
  ],
};

export const SCORED_QUESTIONS: ScoredQuestion[] = [
  Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, Q14, Q15,
];

export const ALL_QUESTIONS: Question[] = [
  ANCHOR_A1, ANCHOR_A2, ANCHOR_A3, ANCHOR_A4,
  ...SCORED_QUESTIONS,
];

export function isQuestionShown(question: Question, answers: AnswerMap): boolean {
  if (question.kind !== 'scored') return true;
  return question.showIf ? question.showIf(answers) : true;
}

/** Ordered list of scored questions that apply given the current answers (skips Q12 when not applicable). */
export function shownScoredQuestions(answers: AnswerMap): ScoredQuestion[] {
  return SCORED_QUESTIONS.filter((q) => isQuestionShown(q, answers));
}
