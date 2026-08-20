import { describe, expect, it } from 'bun:test';
import { allBlindAnswers, allSightedAnswers, buildAnswers } from './__test-utils__';
import { ARCHETYPE_RECOMMENDATIONS, RECOMMENDATION_LIBRARY } from './recommendations';
import { evaluateDiagnostic } from './evaluate';

describe('evaluateDiagnostic', () => {
  it('quotes the initiative text back verbatim', () => {
    const answers = { ...allSightedAnswers(), A1: { value: 'Roll out the new store checkout flow' } };
    expect(evaluateDiagnostic(answers).initiativeText).toBe('Roll out the new store checkout flow');
  });

  it('never renders an empty mirror section', () => {
    const result = evaluateDiagnostic(buildAnswers({}));
    expect(result.mirrorsShown.length).toBeGreaterThan(0);
  });

  it('always returns exactly three recommendations', () => {
    expect(evaluateDiagnostic(allSightedAnswers()).recommendations).toHaveLength(3);
    expect(evaluateDiagnostic(allBlindAnswers()).recommendations).toHaveLength(3);
  });

  it('an all-blind run resolves to the structurally blind archetype', () => {
    const result = evaluateDiagnostic(allBlindAnswers());
    expect(result.archetype).toBe('structurally-blind');
    expect(result.headline).toBe('Nothing in place would tell you this had stopped being worth it');
  });

  it('an all-sighted run with Q11=yes resolves to well-instrumented and fires M9', () => {
    const answers = { ...allSightedAnswers(), ...buildAnswers({ Q11: 'yes', Q12: 'raised-and-acted-on' }) };
    const result = evaluateDiagnostic(answers);
    expect(result.archetype).toBe('well-instrumented');
    expect(result.mirrorsFired).toContain('M9');
  });

  it('records every fired mirror, not just the three shown', () => {
    // allBlindAnswers fires five rules (M1, M3, M5, M7, M8); only the top three show.
    const result = evaluateDiagnostic(allBlindAnswers());
    expect(result.mirrorsFired.length).toBe(5);
    expect(result.mirrorsShown.length).toBe(3);
  });
});

describe('recommendation library', () => {
  it('every archetype maps to exactly three recommendations', () => {
    for (const recIds of Object.values(ARCHETYPE_RECOMMENDATIONS)) {
      expect(recIds).toHaveLength(3);
    }
  });

  it('every recommendation id referenced by an archetype exists in the library', () => {
    for (const recIds of Object.values(ARCHETYPE_RECOMMENDATIONS)) {
      for (const id of recIds) {
        expect(RECOMMENDATION_LIBRARY[id]).toBeDefined();
      }
    }
  });

  it('every library entry is used by at least one archetype', () => {
    const used = new Set(Object.values(ARCHETYPE_RECOMMENDATIONS).flat());
    for (const id of Object.keys(RECOMMENDATION_LIBRARY)) {
      expect(used.has(id as never)).toBe(true);
    }
  });
});
