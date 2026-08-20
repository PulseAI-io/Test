import { describe, expect, it } from 'bun:test';
import { isFreeEmailProvider } from './free-email-providers';

describe('isFreeEmailProvider', () => {
  it('flags common consumer providers', () => {
    expect(isFreeEmailProvider('person@gmail.com')).toBe(true);
    expect(isFreeEmailProvider('Person@Yahoo.com')).toBe(true);
  });

  it('does not flag a work domain', () => {
    expect(isFreeEmailProvider('marcello@sygenti.com')).toBe(false);
  });

  it('is false for a malformed address', () => {
    expect(isFreeEmailProvider('not-an-email')).toBe(false);
  });
});
