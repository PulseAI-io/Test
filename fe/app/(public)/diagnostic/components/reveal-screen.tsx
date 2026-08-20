import type { RevealResult } from '@pulse/shared/diagnostic';
import { AskSection } from './ask-section';
import { MirrorPassageBlock } from './mirror-passage';
import { PillarRow } from './pillar-row';
import { RecommendationCard } from './recommendation-card';
import { RevealSpine } from './spine';

interface RevealScreenProps {
  result: RevealResult;
  sessionId: string;
  emailAlreadyCaptured: boolean;
}

/** Screen order per §9: initiative, archetype headline, pillar rows, mirror, recommendations, ask. */
export function RevealScreen({ result, sessionId, emailAlreadyCaptured }: RevealScreenProps) {
  const blindSegments: [boolean, boolean, boolean] = [
    result.pillars.organisation.band === 'blind',
    result.pillars.team.band === 'blind',
    result.pillars.self.band === 'blind',
  ];

  return (
    <div className="diag-question-enter flex flex-1 gap-2 px-5 py-10 sm:px-10 sm:py-14">
      <RevealSpine blindSegments={blindSegments} />

      <div className="flex max-w-3xl flex-1 flex-col gap-10">
        <div>
          <p className="diag-mono text-xs uppercase tracking-[0.06em] text-[color:var(--mut)]">
            On &ldquo;{result.initiativeText}&rdquo;
          </p>
          <h1 className="diag-question mt-3 text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
            {result.headline}
          </h1>
        </div>

        <div>
          <PillarRow result={result.pillars.organisation} />
          <PillarRow result={result.pillars.team} />
          <PillarRow result={result.pillars.self} />
        </div>

        <div className="flex flex-col gap-6">
          {result.mirrorsShown.map((passage, index) => (
            <MirrorPassageBlock key={`${passage.id}-${index}`} passage={passage} />
          ))}
        </div>

        <div>
          <h2 className="diag-mono mb-4 text-xs uppercase tracking-[0.06em] text-[color:var(--mut)]">
            What you can do this week
          </h2>
          <div className="flex flex-col gap-3">
            {result.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>

        <AskSection
          result={result}
          sessionId={sessionId}
          emailAlreadyCaptured={emailAlreadyCaptured}
        />
      </div>
    </div>
  );
}
