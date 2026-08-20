import { describe, expect, it } from 'bun:test';
import { ARCHETYPE_HEADLINE, resolveArchetype } from './archetypes';
import type { PillarResult, PillarScores } from './scoring';
import type { Band, Pillar } from './types';

function pillarResult(pillar: Pillar, band: Band): PillarResult {
  const score = band === 'sighted' ? 90 : band === 'partial' ? 55 : 10;
  return { pillar, band, score, pointsEarned: 0, pointsPossible: 10 };
}

function pillars(organisation: Band, team: Band, self: Band): PillarScores {
  return {
    organisation: pillarResult('organisation', organisation),
    team: pillarResult('team', team),
    self: pillarResult('self', self),
  };
}

describe('resolveArchetype', () => {
  it('1 — the one who already knows: self blind, organisation sighted', () => {
    expect(resolveArchetype(pillars('sighted', 'partial', 'blind'))).toBe('one-who-already-knows');
  });

  it('1 — the one who already knows: self blind, team sighted', () => {
    expect(resolveArchetype(pillars('partial', 'sighted', 'blind'))).toBe('one-who-already-knows');
  });

  it('2 — flying on instruments: team blind, organisation not blind', () => {
    expect(resolveArchetype(pillars('partial', 'blind', 'partial'))).toBe('flying-on-instruments');
  });

  it('3 — running on Januarys logic: organisation blind, team not blind', () => {
    expect(resolveArchetype(pillars('blind', 'partial', 'partial'))).toBe('running-on-januarys-logic');
  });

  it('4 — structurally blind: organisation and team both blind', () => {
    expect(resolveArchetype(pillars('blind', 'blind', 'partial'))).toBe('structurally-blind');
  });

  it('4 takes priority over 1 when self is also blind alongside both O and T blind', () => {
    expect(resolveArchetype(pillars('blind', 'blind', 'blind'))).toBe('structurally-blind');
  });

  it('5 — sighted, unowned: all three pillars exactly partial', () => {
    expect(resolveArchetype(pillars('partial', 'partial', 'partial'))).toBe('sighted-unowned');
  });

  it('6 — well instrumented: all three pillars sighted', () => {
    expect(resolveArchetype(pillars('sighted', 'sighted', 'sighted'))).toBe('well-instrumented');
  });

  it('rule 1 wins over rule 2/3 when self is blind and one other pillar is sighted', () => {
    // T is blind (would match rule 2) but S is also blind with O sighted, so rule 1 (checked first) wins.
    expect(resolveArchetype(pillars('sighted', 'blind', 'blind'))).toBe('one-who-already-knows');
  });

  describe('documented fallbacks for combinations the spec table leaves unstated', () => {
    it('self blind, neither other pillar blind nor sighted → falls back to "one who already knows"', () => {
      expect(resolveArchetype(pillars('partial', 'partial', 'blind'))).toBe('one-who-already-knows');
    });

    it('no pillar blind, mixed partial/sighted (not uniform) → falls back to "sighted, unowned"', () => {
      expect(resolveArchetype(pillars('sighted', 'partial', 'partial'))).toBe('sighted-unowned');
      expect(resolveArchetype(pillars('sighted', 'sighted', 'partial'))).toBe('sighted-unowned');
      expect(resolveArchetype(pillars('partial', 'sighted', 'sighted'))).toBe('sighted-unowned');
    });
  });

  it('every archetype has a headline', () => {
    const archetypes = [
      'one-who-already-knows',
      'flying-on-instruments',
      'running-on-januarys-logic',
      'structurally-blind',
      'sighted-unowned',
      'well-instrumented',
    ] as const;
    for (const id of archetypes) {
      expect(ARCHETYPE_HEADLINE[id]).toBeTruthy();
    }
  });
});
