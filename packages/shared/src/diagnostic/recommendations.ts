import type { ArchetypeId } from './archetypes';

export type RecId =
  | 'write-down-the-three-conditions'
  | 'give-each-condition-an-owner'
  | 'ask-the-reversal-question'
  | 'separate-the-two-questions'
  | 'audit-one-green'
  | 'write-the-stop-case'
  | 'say-the-thing-you-have-been-holding'
  | 'date-your-last-look';

export type Effort = '20 minutes' | 'An hour' | 'One meeting';

export interface Recommendation {
  id: RecId;
  title: string;
  body: string;
  effort: Effort;
}

export const RECOMMENDATION_LIBRARY: Record<RecId, Recommendation> = {
  'write-down-the-three-conditions': {
    id: 'write-down-the-three-conditions',
    title: 'Write down the three conditions',
    body:
      'Name the three things that must stay true for this to still be worth finishing. Cost holding, a date landing, a competitor not moving. Put them somewhere other people can see. Most initiatives have never had this written once.',
    effort: '20 minutes',
  },
  'give-each-condition-an-owner': {
    id: 'give-each-condition-an-owner',
    title: 'Give each condition an owner',
    body:
      'Next to each condition, put one name. Not a committee. The person who would notice first if it stopped being true. Ownership is what turns a condition into something that gets checked.',
    effort: '20 minutes',
  },
  'ask-the-reversal-question': {
    id: 'ask-the-reversal-question',
    title: 'Ask the reversal question at the next review',
    body:
      'Ask the room: what would have to be true for us to stop this? If nobody can answer inside a minute, that is the finding, and it is worth more than the status update the meeting was scheduled for.',
    effort: 'One meeting',
  },
  'separate-the-two-questions': {
    id: 'separate-the-two-questions',
    title: 'Separate the two questions in your reporting',
    body:
      'Add one field next to your status: still worth finishing, yes or no, with a reason. On schedule and still worth it are different questions and only one of them is currently being reported to you.',
    effort: 'An hour',
  },
  'audit-one-green': {
    id: 'audit-one-green',
    title: 'Audit one green',
    body:
      'Take a single item currently reporting green. Ask what was verified to make it green. If the answer is that someone updated a field, you now know what every other green on the board is worth.',
    effort: 'An hour',
  },
  'write-the-stop-case': {
    id: 'write-the-stop-case',
    title: 'Write the stop case',
    body:
      'Draft the argument that this should stop. Not to make it. To find out how long it takes and what you do not have. The gaps you hit are the evidence you are missing when you need it most.',
    effort: 'An hour',
  },
  'say-the-thing-you-have-been-holding': {
    id: 'say-the-thing-you-have-been-holding',
    title: 'Say the thing you have been holding',
    body:
      'You have a suspicion you have not raised because you cannot yet prove it. Raise it as a question with the condition attached, not as a claim. "I want to check whether X still holds" is a different conversation from "I think this is failing."',
    effort: 'One meeting',
  },
  'date-your-last-look': {
    id: 'date-your-last-look',
    title: 'Date your last look',
    body:
      'For each of the three conditions, write the date you last saw actual evidence about it. Not when you last discussed it. When you last saw something. The dates are usually older than people expect.',
    effort: '20 minutes',
  },
};

export const ARCHETYPE_RECOMMENDATIONS: Record<ArchetypeId, RecId[]> = {
  'one-who-already-knows': [
    'say-the-thing-you-have-been-holding',
    'write-the-stop-case',
    'date-your-last-look',
  ],
  'flying-on-instruments': ['separate-the-two-questions', 'audit-one-green', 'ask-the-reversal-question'],
  'running-on-januarys-logic': [
    'write-down-the-three-conditions',
    'give-each-condition-an-owner',
    'write-the-stop-case',
  ],
  'structurally-blind': [
    'write-down-the-three-conditions',
    'give-each-condition-an-owner',
    'separate-the-two-questions',
  ],
  'sighted-unowned': [
    'write-down-the-three-conditions',
    'give-each-condition-an-owner',
    'date-your-last-look',
  ],
  'well-instrumented': ['separate-the-two-questions', 'write-the-stop-case', 'date-your-last-look'],
};

export function recommendationsForArchetype(archetype: ArchetypeId): Recommendation[] {
  return ARCHETYPE_RECOMMENDATIONS[archetype].map((id) => RECOMMENDATION_LIBRARY[id]);
}
