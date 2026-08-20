import {
  BAND_LABEL,
  BAND_READING,
  DIAGNOSTIC_COPY,
  PILLAR_LABEL,
  type RevealResult,
} from '@pulse/shared/diagnostic';

const PILLARS = ['organisation', 'team', 'self'] as const;

/** Plain-text rendering of the reveal, for the "Copy as text" action (§9, acceptance criterion 10). */
export function revealToPlainText(result: RevealResult): string {
  const lines: string[] = [];

  lines.push(`On "${result.initiativeText}"`, '');
  lines.push(result.headline, '');

  for (const pillar of PILLARS) {
    const pillarResult = result.pillars[pillar];
    lines.push(`${PILLAR_LABEL[pillar]}: ${BAND_LABEL[pillarResult.band]}`);
    lines.push(BAND_READING[pillarResult.band]);
    lines.push('');
  }

  for (const mirror of result.mirrorsShown) {
    lines.push(mirror.text, '');
  }

  lines.push('What you can do this week:', '');
  for (const rec of result.recommendations) {
    lines.push(`${rec.title} (${rec.effort})`);
    lines.push(rec.body, '');
  }

  lines.push(DIAGNOSTIC_COPY.askHeading);
  lines.push(DIAGNOSTIC_COPY.askBody);

  return lines.join('\n').trim();
}
