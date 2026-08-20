/**
 * Enforces the Sygenti banned word list against diagnostic copy (question
 * text, options, mirror passages, archetype headlines, recommendations, and
 * reveal copy). See §4 of the build spec.
 */

const EM_DASH = '—';

const BANNED_PHRASES: string[] = [
  'platform',
  'workflow',
  'automation',
  'visibility',
  'centralised',
  'single source of truth',
  'knowledge graph',
  'nervous system',
  'the company brain',
  'leading',
  'best',
  'world-class',
  'empower',
  'unlock',
  'transform',
  'revolutionise',
  'seamless',
];

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function phraseRegex(phrase: string): RegExp {
  const pattern = escapeRegExp(phrase).replace(/\s+/g, '\\s+');
  return new RegExp(`\\b${pattern}\\b`, 'gi');
}

export interface CopyLintViolation {
  term: string;
  index: number;
  excerpt: string;
}

function excerptAround(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + length + 20);
  return text.slice(start, end);
}

/** Scans one string for banned terms and em dashes. Returns every violation found. */
export function lintCopy(text: string): CopyLintViolation[] {
  const violations: CopyLintViolation[] = [];

  let emDashIndex = text.indexOf(EM_DASH);
  while (emDashIndex !== -1) {
    violations.push({ term: 'em dash', index: emDashIndex, excerpt: excerptAround(text, emDashIndex, 1) });
    emDashIndex = text.indexOf(EM_DASH, emDashIndex + 1);
  }

  for (const phrase of BANNED_PHRASES) {
    for (const match of text.matchAll(phraseRegex(phrase))) {
      const index = match.index ?? -1;
      violations.push({ term: phrase, index, excerpt: excerptAround(text, index, match[0].length) });
    }
  }

  // "AI" is checked as a standalone capitalised acronym only, so this
  // doesn't flag ordinary words that happen to contain the letters.
  for (const match of text.matchAll(/\bAI\b/g)) {
    const index = match.index ?? -1;
    violations.push({ term: 'AI', index, excerpt: excerptAround(text, index, 2) });
  }

  return violations;
}

/** Scans many strings at once, tagging each violation with which string it came from. */
export function lintCopyEntries(
  entries: Array<{ label: string; text: string }>
): Array<CopyLintViolation & { label: string }> {
  return entries.flatMap(({ label, text }) => lintCopy(text).map((v) => ({ ...v, label })));
}
