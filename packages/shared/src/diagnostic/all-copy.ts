import { ARCHETYPE_HEADLINE } from './archetypes';
import { COMPANY_SIZE_OPTIONS, SECTOR_OPTIONS } from './capture';
import { BAND_READING, DIAGNOSTIC_COPY } from './copy';
import { allMirrorTexts } from './mirror';
import { ALL_QUESTIONS } from './questions';
import { RECOMMENDATION_LIBRARY } from './recommendations';

export interface CopyEntry {
  label: string;
  text: string;
}

/** Every piece of diagnostic-facing copy, labelled by source, for the banned-word lint check. */
export function collectAllCopyEntries(): CopyEntry[] {
  const entries: CopyEntry[] = [];

  for (const question of ALL_QUESTIONS) {
    entries.push({ label: `${question.id}.prompt`, text: question.prompt });
    if (question.helper) entries.push({ label: `${question.id}.helper`, text: question.helper });
    if (question.kind === 'scored') {
      entries.push({ label: `${question.id}.eyebrow`, text: question.eyebrow });
      entries.push({ label: `${question.id}.shortLabel`, text: question.shortLabel });
    }
    if (question.kind !== 'text') {
      for (const option of question.options) {
        entries.push({ label: `${question.id}.option.${option.id}`, text: option.label });
      }
    }
  }

  for (const { id, text } of allMirrorTexts()) {
    entries.push({ label: `mirror.${id}`, text });
  }

  for (const [archetype, headline] of Object.entries(ARCHETYPE_HEADLINE)) {
    entries.push({ label: `archetype.${archetype}`, text: headline });
  }

  for (const rec of Object.values(RECOMMENDATION_LIBRARY)) {
    entries.push({ label: `recommendation.${rec.id}.title`, text: rec.title });
    entries.push({ label: `recommendation.${rec.id}.body`, text: rec.body });
  }

  for (const [key, text] of Object.entries(DIAGNOSTIC_COPY)) {
    entries.push({ label: `copy.${key}`, text });
  }

  for (const [band, text] of Object.entries(BAND_READING)) {
    entries.push({ label: `bandReading.${band}`, text });
  }

  for (const option of [...COMPANY_SIZE_OPTIONS, ...SECTOR_OPTIONS]) {
    entries.push({ label: `capture.${option.id}`, text: option.label });
  }

  return entries;
}
