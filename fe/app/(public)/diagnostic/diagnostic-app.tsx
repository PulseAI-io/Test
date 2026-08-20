'use client';

import { evaluateDiagnostic } from '@pulse/shared/diagnostic';
import { useEffect, useMemo, useRef } from 'react';
import { CaptureScreen } from './components/capture-screen';
import { QuestionScreen } from './components/question-screen';
import { RevealScreen } from './components/reveal-screen';
import { Spine } from './components/spine';
import { computeBoundaries, computeProgress } from './lib/spine-progress';
import { completeDiagnostic, saveDiagnosticProgress } from './lib/submit';
import { useDiagnosticState } from './lib/use-diagnostic-state';

export function DiagnosticApp() {
  const state = useDiagnosticState();
  const completedRef = useRef(false);
  const prevScreenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state.hydrated) return;
    if (prevScreenRef.current === state.currentScreen) return;
    prevScreenRef.current = state.currentScreen;
    if (state.currentScreen !== 'capture' && state.currentScreen !== 'reveal') {
      saveDiagnosticProgress(state.sessionId, state.answers, state.currentScreen);
    }
  }, [state.hydrated, state.currentScreen, state.sessionId, state.answers]);

  const result = useMemo(() => {
    if (state.currentScreen !== 'reveal') return null;
    return evaluateDiagnostic(state.answers);
  }, [state.currentScreen, state.answers]);

  useEffect(() => {
    if (state.currentScreen === 'reveal' && !completedRef.current) {
      completedRef.current = true;
      completeDiagnostic(state.sessionId, state.answers, state.capture, state.startedAt);
    }
  }, [state.currentScreen, state.sessionId, state.answers, state.capture, state.startedAt]);

  const spineBoundaries = useMemo(() => computeBoundaries(state.answers), [state.answers]);
  const spineProgress = useMemo(
    () => computeProgress(state.currentScreen, state.answers),
    [state.currentScreen, state.answers]
  );

  if (!state.hydrated) {
    return <div className="diag min-h-screen" />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl">
      {state.currentScreen !== 'reveal' && (
        <Spine progressFraction={spineProgress} boundaries={spineBoundaries} />
      )}

      <div className="flex flex-1 flex-col">
        {state.currentScreen === 'capture' && (
          <CaptureScreen
            capture={state.capture}
            onChange={state.updateCapture}
            onContinue={state.advanceFromCapture}
            onBack={state.goBack}
          />
        )}

        {state.currentQuestion && (
          <QuestionScreen
            question={state.currentQuestion}
            answers={state.answers}
            pillarPosition={state.pillarPosition}
            canGoBack={state.canGoBack}
            onBack={state.goBack}
            onAnswer={(value, points) => {
              const question = state.currentQuestion;
              if (question) state.answerAndAdvance(question.id, value, points);
            }}
          />
        )}

        {state.currentScreen === 'reveal' && result && (
          <RevealScreen
            result={result}
            sessionId={state.sessionId}
            emailAlreadyCaptured={Boolean(state.capture.email.trim())}
          />
        )}
      </div>
    </div>
  );
}
