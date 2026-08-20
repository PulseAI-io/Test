import { describe, expect, it } from 'bun:test';
import { collectAllCopyEntries } from './all-copy';
import { lintCopy, lintCopyEntries } from './copy-lint';

describe('lintCopy', () => {
  it('flags an em dash', () => {
    expect(lintCopy('This is a test — of the line.').map((v) => v.term)).toContain('em dash');
  });

  it('flags a banned phrase case-insensitively', () => {
    expect(lintCopy('Our new platform is great').map((v) => v.term)).toContain('platform');
  });

  it('flags the standalone acronym AI', () => {
    expect(lintCopy('Powered by AI').map((v) => v.term)).toContain('AI');
  });

  it('does not flag "AI" as a substring of an ordinary word', () => {
    expect(lintCopy('We maintain and explain the against clause').map((v) => v.term)).not.toContain('AI');
  });

  it('does not flag clean copy', () => {
    expect(lintCopy('Nobody is responsible for checking whether the conditions still hold.')).toHaveLength(0);
  });

  it('finds nothing across a clean batch', () => {
    const violations = lintCopyEntries([
      { label: 'a', text: 'A named owner, as part of their role' },
      { label: 'b', text: 'Something in place would surface it' },
    ]);
    expect(violations).toHaveLength(0);
  });
});

describe('all diagnostic copy passes the banned word list', () => {
  it('every question, mirror, archetype, recommendation and interface string is clean', () => {
    const entries = collectAllCopyEntries();
    expect(entries.length).toBeGreaterThan(0);
    const violations = lintCopyEntries(entries);
    if (violations.length > 0) {
      const report = violations.map((v) => `${v.label}: "${v.term}" near "${v.excerpt}"`).join('\n');
      throw new Error(`Banned word list violations found:\n${report}`);
    }
    expect(violations).toHaveLength(0);
  });
});
