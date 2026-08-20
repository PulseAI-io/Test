import type { PillarScores } from './scoring';
import type { Band } from './types';

export type ArchetypeId =
  | 'one-who-already-knows'
  | 'flying-on-instruments'
  | 'running-on-januarys-logic'
  | 'structurally-blind'
  | 'sighted-unowned'
  | 'well-instrumented';

export const ARCHETYPE_HEADLINE: Record<ArchetypeId, string> = {
  'one-who-already-knows': 'You are the detection system, and there is no backup',
  'flying-on-instruments': 'Your reporting answers the wrong question, reliably',
  'running-on-januarys-logic': 'The work is tracked. The reasoning behind it is not',
  'structurally-blind': 'Nothing in place would tell you this had stopped being worth it',
  'sighted-unowned': 'Everything depends on someone remembering to look',
  'well-instrumented': 'You can see the delivery clearly. That is not the same as seeing the decision',
};

type Bands = { organisation: Band; team: Band; self: Band };

function bandsOf(pillars: PillarScores): Bands {
  return {
    organisation: pillars.organisation.band,
    team: pillars.team.band,
    self: pillars.self.band,
  };
}

/**
 * Resolves the archetype from the three pillar bands, in the priority order
 * given by the build spec (first match wins). The spec's six rules do not
 * cover every one of the 27 band combinations — any all-partial-or-sighted
 * mix that isn't uniformly one or the other, and self=blind paired with two
 * non-blind (but not both sighted) pillars, are left unstated. Two
 * deliberate, documented fallbacks close that gap without inventing a new
 * archetype: self=blind alongside a non-blind/non-blind pair that missed
 * rule 1 only because neither reached "sighted" still reads as "the person
 * caught what nothing else did", so it resolves to the same archetype as
 * rule 1; any other uncovered mix has no blind pillar at all, so it reads
 * closest to "sighted, unowned" (nothing is broken, nothing is owned).
 */
export function resolveArchetype(pillars: PillarScores): ArchetypeId {
  const { organisation: o, team: t, self: s } = bandsOf(pillars);

  if (s === 'blind' && (o === 'sighted' || t === 'sighted')) return 'one-who-already-knows';
  if (t === 'blind' && o !== 'blind') return 'flying-on-instruments';
  if (o === 'blind' && t !== 'blind') return 'running-on-januarys-logic';
  if (o === 'blind' && t === 'blind') return 'structurally-blind';
  if (o !== 'sighted' && t !== 'sighted' && s !== 'sighted' && o !== 'blind' && t !== 'blind' && s !== 'blind') {
    return 'sighted-unowned';
  }
  if (o === 'sighted' && t === 'sighted' && s === 'sighted') return 'well-instrumented';

  // Fallback 1: self caught it, neither other pillar was fully blind either.
  if (s === 'blind') return 'one-who-already-knows';

  // Fallback 2: no pillar is blind, but the mix is neither uniform partial
  // nor uniform sighted.
  return 'sighted-unowned';
}
