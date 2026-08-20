import type { Band } from './types';

/** The reveal's one-line reading per pillar row, keyed by that pillar's band. */
export const BAND_READING: Record<Band, string> = {
  sighted: 'The check exists and someone owns it.',
  partial: 'It depends on an individual remembering.',
  blind: 'Nothing would surface it.',
};

/** Static interface copy that isn't attached to a question, mirror, archetype or recommendation. */
export const DIAGNOSTIC_COPY = {
  captureHeading: 'Where should the reading go?',
  captureBody:
    'Your answers have produced a specific picture. Tell us where you sit so the reading is calibrated to it, and we will put a copy in your inbox.',
  freeEmailProviderNudge: 'A work address means we can calibrate against your sector.',
  askHeading: 'The way in is a conversation, not a purchase.',
  askBody:
    'One real initiative, thirty minutes. No pitch, nothing to sign. If any of this is something you have lived, I would value a short conversation.',
  bookButtonLabel: 'Book thirty minutes',
  emailMeLabel: 'Email me this reading',
  copyAsTextLabel: 'Copy as text',
  privacyLine:
    'We store your answers and contact details to build this reading and follow up if you ask us to. We do not sell them. Ask us any time to have them deleted.',
} as const;
