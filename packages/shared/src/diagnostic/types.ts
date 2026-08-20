/**
 * Initiative Blind Spot Diagnostic — shared types.
 *
 * IDs here match the build spec exactly (A1-A4 anchor, Q1-Q15 pillar
 * questions) so answers can be referenced unambiguously across the
 * question data, scoring, mirror and archetype modules, and the stored
 * submission row.
 */

export type Pillar = 'organisation' | 'team' | 'self';

export type Band = 'blind' | 'partial' | 'sighted';

export const BAND_LABEL: Record<Band, string> = {
  blind: 'Structurally blind',
  partial: 'Partial sight',
  sighted: 'Sighted',
};

export const PILLAR_LABEL: Record<Pillar, string> = {
  organisation: 'Organisation',
  team: 'Team',
  self: 'Self',
};

export type AnchorQuestionId = 'A1' | 'A2' | 'A3' | 'A4';

export type ScoredQuestionId =
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'Q5'
  | 'Q6'
  | 'Q7'
  | 'Q8'
  | 'Q9'
  | 'Q10'
  | 'Q11'
  | 'Q12'
  | 'Q13'
  | 'Q14'
  | 'Q15';

export type QuestionId = AnchorQuestionId | ScoredQuestionId;

export interface Option {
  id: string;
  label: string;
}

export interface ScoredOption extends Option {
  points: 0 | 1 | 2;
}

export interface FreeTextQuestion {
  kind: 'text';
  id: 'A1';
  prompt: string;
  helper?: string;
  maxLength: number;
}

export interface AnchorSelectQuestion {
  kind: 'anchor-select';
  id: 'A2' | 'A3' | 'A4';
  prompt: string;
  helper?: string;
  options: Option[];
}

export interface ScoredQuestion {
  kind: 'scored';
  id: ScoredQuestionId;
  pillar: Pillar;
  eyebrow: string;
  prompt: string;
  helper?: string;
  /** Compact paraphrase used in the mirror fallback lines. */
  shortLabel: string;
  options: ScoredOption[];
  /** Only Q12 defines this: shown only when Q11 is 'yes' or 'wondered-not-seriously'. */
  showIf?: (answers: AnswerMap) => boolean;
}

export type Question = FreeTextQuestion | AnchorSelectQuestion | ScoredQuestion;

export interface Answer {
  value: string;
  points?: number;
}

export type AnswerMap = Partial<Record<QuestionId, Answer>>;

export function answerValue(answers: AnswerMap, id: QuestionId): string | undefined {
  return answers[id]?.value;
}
