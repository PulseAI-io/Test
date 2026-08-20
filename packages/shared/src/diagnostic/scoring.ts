import { shownScoredQuestions } from './questions';
import type { AnswerMap, Band, Pillar } from './types';

export interface PillarResult {
  pillar: Pillar;
  pointsEarned: number;
  pointsPossible: number;
  score: number;
  band: Band;
}

export function bandForScore(score: number): Band {
  if (score >= 70) return 'sighted';
  if (score >= 40) return 'partial';
  return 'blind';
}

export function scorePillar(pillar: Pillar, answers: AnswerMap): PillarResult {
  const questions = shownScoredQuestions(answers).filter((q) => q.pillar === pillar);
  const pointsPossible = questions.length * 2;
  const pointsEarned = questions.reduce((sum, q) => sum + (answers[q.id]?.points ?? 0), 0);
  const score = pointsPossible === 0 ? 0 : Math.round((pointsEarned / pointsPossible) * 100);
  return { pillar, pointsEarned, pointsPossible, score, band: bandForScore(score) };
}

export interface PillarScores {
  organisation: PillarResult;
  team: PillarResult;
  self: PillarResult;
}

export function scoreAllPillars(answers: AnswerMap): PillarScores {
  return {
    organisation: scorePillar('organisation', answers),
    team: scorePillar('team', answers),
    self: scorePillar('self', answers),
  };
}
