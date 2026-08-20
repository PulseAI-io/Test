import { describe, expect, it } from 'bun:test';
import { allBlindAnswers, allSightedAnswers, buildAnswers } from './__test-utils__';
import { bandForScore, scoreAllPillars, scorePillar } from './scoring';

describe('bandForScore', () => {
  it('bands 70-100 as sighted', () => {
    expect(bandForScore(70)).toBe('sighted');
    expect(bandForScore(100)).toBe('sighted');
  });

  it('bands 40-69 as partial', () => {
    expect(bandForScore(40)).toBe('partial');
    expect(bandForScore(69)).toBe('partial');
  });

  it('bands 0-39 as blind', () => {
    expect(bandForScore(0)).toBe('blind');
    expect(bandForScore(39)).toBe('blind');
  });
});

describe('scorePillar', () => {
  it('scores organisation and team out of 10 always', () => {
    const answers = allSightedAnswers();
    expect(scorePillar('organisation', answers).pointsPossible).toBe(10);
    expect(scorePillar('team', answers).pointsPossible).toBe(10);
  });

  it('scores self out of 8 when Q12 is skipped (Q11 = No)', () => {
    const answers = allSightedAnswers();
    const self = scorePillar('self', answers);
    expect(self.pointsPossible).toBe(8);
    expect(self.pointsEarned).toBe(8);
    expect(self.score).toBe(100);
    expect(self.band).toBe('sighted');
  });

  it('scores self out of 10 when Q12 is shown (Q11 = Yes)', () => {
    const answers = allBlindAnswers();
    const self = scorePillar('self', answers);
    expect(self.pointsPossible).toBe(10);
  });

  it('an all-max answer set scores 100 and bands sighted', () => {
    const answers = allSightedAnswers();
    const org = scorePillar('organisation', answers);
    expect(org.pointsEarned).toBe(10);
    expect(org.score).toBe(100);
    expect(org.band).toBe('sighted');
  });

  it('an all-zero answer set scores 0 and bands blind', () => {
    const answers = allBlindAnswers();
    const org = scorePillar('organisation', answers);
    expect(org.pointsEarned).toBe(0);
    expect(org.score).toBe(0);
    expect(org.band).toBe('blind');
  });
});

describe('scoreAllPillars', () => {
  it('returns all three pillars', () => {
    const result = scoreAllPillars(allSightedAnswers());
    expect(result.organisation.band).toBe('sighted');
    expect(result.team.band).toBe('sighted');
    expect(result.self.band).toBe('sighted');
  });

  it('does not let a skipped Q12 distort the self pillar score', () => {
    // Q11 = 'wondered-not-seriously' (1pt) shows Q12; answering it well
    // should not make self appear stronger than a full sweep of 2s elsewhere.
    const answers = buildAnswers({
      Q11: 'wondered-not-seriously',
      Q12: 'raised-and-acted-on',
      Q13: 'taken-seriously',
      Q14: 'mostly-recent-evidence',
      Q15: 'could-make-case-now',
    });
    const self = scoreAllPillars(answers).self;
    // 1 + 2 + 2 + 2 + 2 = 9 out of 10 possible (Q12 shown)
    expect(self.pointsPossible).toBe(10);
    expect(self.pointsEarned).toBe(9);
    expect(self.score).toBe(90);
  });
});
