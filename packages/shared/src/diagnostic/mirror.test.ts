import { describe, expect, it } from 'bun:test';
import { allBlindAnswers, allSightedAnswers, buildAnswers } from './__test-utils__';
import { evaluateMirrors, selectShownMirrors } from './mirror';

describe('evaluateMirrors — each rule can be triggered independently', () => {
  it('M1 — the held suspicion (via Q12)', () => {
    const answers = buildAnswers({ Q11: 'yes', Q12: 'held-waiting-for-proof' });
    expect(evaluateMirrors(answers)).toContain('M1');
  });

  it('M1 — the held suspicion (via Q13, without Q12)', () => {
    const answers = buildAnswers({ Q11: 'yes', Q13: 'learned-to-wait-for-proof' });
    expect(evaluateMirrors(answers)).toContain('M1');
  });

  it('M1 does not fire when Q11 is not yes', () => {
    const answers = buildAnswers({ Q11: 'wondered-not-seriously', Q13: 'learned-to-wait-for-proof' });
    expect(evaluateMirrors(answers)).not.toContain('M1');
  });

  it('M2 — the confident assumption', () => {
    const answers = buildAnswers({ A4: 'yes', Q14: 'mostly-assumption' });
    expect(evaluateMirrors(answers)).toContain('M2');
  });

  it('M3 — nobody is watching the door', () => {
    const answers = buildAnswers({ Q3: 'nobody', Q5: 'from-outside-after-fact' });
    expect(evaluateMirrors(answers)).toContain('M3');
  });

  it('M4 — green means nothing was checked', () => {
    const answers = buildAnswers({ Q7: 'card-moved-field-updated', Q9: 'most-of-it-myself' });
    expect(evaluateMirrors(answers)).toContain('M4');
  });

  it('M5 — the case you cannot make', () => {
    const answers = buildAnswers({ Q1: 'deadline-budget-only', Q15: 'would-not-know-where-to-start' });
    expect(evaluateMirrors(answers)).toContain('M5');
  });

  it('M6 — running on old logic', () => {
    const answers = buildAnswers({ A2: 'over-12-months', Q4: 'nothing' });
    expect(evaluateMirrors(answers)).toContain('M6');
  });

  it('M7 — the risk log as a graveyard', () => {
    const answers = buildAnswers({ Q8: 'logged-rarely-looked-at-again', Q10: 'not-confident' });
    expect(evaluateMirrors(answers)).toContain('M7');
  });

  it('M8 — memory as infrastructure', () => {
    const answers = buildAnswers({ Q2: 'lost-to-memory', Q3: 'probably-flag' });
    expect(evaluateMirrors(answers)).toContain('M8');
  });

  it('M8 does not fire when Q3 has a named owner', () => {
    const answers = buildAnswers({ Q2: 'lost-to-memory', Q3: 'named-owner' });
    expect(evaluateMirrors(answers)).not.toContain('M8');
  });

  it('M9 — well instrumented, still exposed (needs all three pillars sighted)', () => {
    const answers = { ...allSightedAnswers(), ...buildAnswers({ Q11: 'yes', Q12: 'raised-and-acted-on' }) };
    expect(evaluateMirrors(answers)).toContain('M9');
  });

  it('M9 does not fire when a pillar is not sighted', () => {
    const answers = buildAnswers({ Q1: 'deadline-budget-only', Q11: 'yes' });
    expect(evaluateMirrors(answers)).not.toContain('M9');
  });
});

describe('evaluateMirrors — priority ordering', () => {
  it('sorts fired rules by ascending priority (M1 sharpest first)', () => {
    const answers = buildAnswers({
      Q11: 'yes',
      Q13: 'learned-to-wait-for-proof', // M1
      Q3: 'nobody', // part of M3 + M8
      Q5: 'from-outside-after-fact', // M3
      A2: 'over-12-months', // part of M6
      Q4: 'nothing', // M6
    });
    const fired = evaluateMirrors(answers);
    expect(fired).toEqual(['M1', 'M3', 'M6']);
  });
});

describe('selectShownMirrors — fallback behaviour (§7.2)', () => {
  it('never returns an empty mirror section', () => {
    const answers = buildAnswers({});
    expect(selectShownMirrors(answers).length).toBeGreaterThan(0);
  });

  it('shows two fallback lines when zero rules fire', () => {
    // Answers picked so nothing crosses any rule's threshold.
    const answers = buildAnswers({
      Q1: 'understood-undocumented',
      Q2: 'reconstructing',
      Q3: 'probably-flag',
      Q4: 'someone-might-link',
      Q5: 'someone-would-notice',
      Q6: 'schedule-only',
      Q7: 'not-sure',
      Q8: 'logged-reviewed-occasionally',
      Q9: 'fair-amount',
      Q10: 'somewhat',
      Q11: 'wondered-not-seriously',
      Q12: 'raised-and-went-nowhere',
      Q13: 'parked-until-proof',
      Q14: 'a-mix',
      Q15: 'days-of-digging',
      A2: 'under-3-months',
      A4: 'partly',
    });
    expect(evaluateMirrors(answers)).toHaveLength(0);
    const shown = selectShownMirrors(answers);
    expect(shown).toHaveLength(2);
    expect(shown.every((m) => m.id === 'fallback')).toBe(true);
  });

  it('shows the one fired rule plus one fallback line when exactly one fires', () => {
    const answers = buildAnswers({
      Q3: 'nobody',
      Q5: 'from-outside-after-fact', // M3 fires
      Q1: 'understood-undocumented',
      Q2: 'reconstructing',
      Q4: 'someone-might-link',
      Q6: 'schedule-only',
      Q7: 'not-sure',
      Q8: 'logged-reviewed-occasionally',
      Q9: 'fair-amount',
      Q10: 'somewhat',
      Q11: 'wondered-not-seriously',
      Q13: 'parked-until-proof',
      Q14: 'a-mix',
      Q15: 'days-of-digging',
    });
    expect(evaluateMirrors(answers)).toEqual(['M3']);
    const shown = selectShownMirrors(answers);
    expect(shown).toHaveLength(2);
    expect(shown[0].id).toBe('M3');
    expect(shown[1].id).toBe('fallback');
  });

  it('shows exactly the top three by priority when five rules fire', () => {
    const answers = allBlindAnswers();
    expect(evaluateMirrors(answers)).toEqual(['M1', 'M3', 'M5', 'M7', 'M8']);
    const shown = selectShownMirrors(answers);
    expect(shown.map((m) => m.id)).toEqual(['M1', 'M3', 'M5']);
  });
});
