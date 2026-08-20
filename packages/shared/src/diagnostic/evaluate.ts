import type { ArchetypeId } from './archetypes';
import { ARCHETYPE_HEADLINE, resolveArchetype } from './archetypes';
import { evaluateMirrors, type MirrorId, type MirrorPassage, selectShownMirrors } from './mirror';
import type { Recommendation } from './recommendations';
import { recommendationsForArchetype } from './recommendations';
import type { PillarScores } from './scoring';
import { scoreAllPillars } from './scoring';
import type { AnswerMap } from './types';
import { answerValue } from './types';

export interface RevealResult {
  initiativeText: string;
  pillars: PillarScores;
  archetype: ArchetypeId;
  headline: string;
  mirrorsFired: MirrorId[];
  mirrorsShown: MirrorPassage[];
  recommendations: Recommendation[];
}

/**
 * Computes everything the reveal screen needs from a completed answer set.
 * Pure and deterministic: safe to run on the client for an instant reveal
 * and again on the server as the stored system of record.
 */
export function evaluateDiagnostic(answers: AnswerMap): RevealResult {
  const pillars = scoreAllPillars(answers);
  const archetype = resolveArchetype(pillars);

  return {
    initiativeText: answerValue(answers, 'A1') ?? '',
    pillars,
    archetype,
    headline: ARCHETYPE_HEADLINE[archetype],
    mirrorsFired: evaluateMirrors(answers),
    mirrorsShown: selectShownMirrors(answers),
    recommendations: recommendationsForArchetype(archetype),
  };
}
