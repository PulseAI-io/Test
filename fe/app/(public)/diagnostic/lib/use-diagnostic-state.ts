'use client';

import type { AnswerMap, Question, QuestionId } from '@pulse/shared/diagnostic';
import { ALL_QUESTIONS, isQuestionShown } from '@pulse/shared/diagnostic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DIAGNOSTIC_STORAGE_KEY } from './config';

export type ScreenId = QuestionId | 'capture' | 'reveal';

export interface CaptureState {
  role: string;
  companySize: string;
  sector: string;
  email: string;
}

const EMPTY_CAPTURE: CaptureState = { role: '', companySize: '', sector: '', email: '' };

interface PersistedState {
  sessionId: string;
  answers: AnswerMap;
  history: ScreenId[];
  historyIndex: number;
  capture: CaptureState;
  startedAt: number;
}

function visibleQuestions(answers: AnswerMap): Question[] {
  return ALL_QUESTIONS.filter((q) => isQuestionShown(q, answers));
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `sid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadPersisted(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.sessionId || !Array.isArray(parsed.history)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function freshState(): PersistedState {
  return {
    sessionId: createSessionId(),
    answers: {},
    history: [ALL_QUESTIONS[0].id as ScreenId],
    historyIndex: 0,
    capture: EMPTY_CAPTURE,
    startedAt: Date.now(),
  };
}

function nextScreenAfter(currentId: ScreenId, answers: AnswerMap): ScreenId {
  if (currentId === 'capture') return 'reveal';
  if (currentId === 'reveal') return 'reveal';
  const shown = visibleQuestions(answers);
  const idx = shown.findIndex((q) => q.id === currentId);
  const next = shown[idx + 1];
  return next ? (next.id as ScreenId) : 'capture';
}

function advanceHistory(
  prev: PersistedState,
  nextId: ScreenId
): Pick<PersistedState, 'history' | 'historyIndex'> {
  const truncated = prev.history.slice(0, prev.historyIndex + 1);
  return { history: [...truncated, nextId], historyIndex: truncated.length };
}

export function useDiagnosticState() {
  // sessionStorage isn't available during SSR, so the real state is loaded
  // once on mount; the server-rendered pass always starts fresh.
  const [state, setState] = useState<PersistedState>(freshState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadPersisted();
    if (loaded) setState(loaded);
    setHydrated(true);
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify(stateRef.current));
  }, [state, hydrated]);

  const currentScreen = state.history[state.historyIndex];

  const currentQuestion: Question | undefined = useMemo(() => {
    if (currentScreen === 'capture' || currentScreen === 'reveal') return undefined;
    return ALL_QUESTIONS.find((q) => q.id === currentScreen);
  }, [currentScreen]);

  const pillarPosition = useMemo(() => {
    if (currentQuestion?.kind !== 'scored') return null;
    const pillarQuestions = visibleQuestions(state.answers).filter(
      (q): q is Question & { kind: 'scored' } =>
        q.kind === 'scored' && q.pillar === currentQuestion.pillar
    );
    const index = pillarQuestions.findIndex((q) => q.id === currentQuestion.id);
    return { pillar: currentQuestion.pillar, position: index + 1, total: pillarQuestions.length };
  }, [currentQuestion, state.answers]);

  /** Records an answer and moves to the next screen in one atomic update. */
  const answerAndAdvance = useCallback((id: QuestionId, value: string, points?: number) => {
    setState((prev) => {
      const answers = { ...prev.answers, [id]: { value, points } };
      const nextId = nextScreenAfter(id, answers);
      return { ...prev, answers, ...advanceHistory(prev, nextId) };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) =>
      prev.historyIndex > 0 ? { ...prev, historyIndex: prev.historyIndex - 1 } : prev
    );
  }, []);

  const updateCapture = useCallback((patch: Partial<CaptureState>) => {
    setState((prev) => ({ ...prev, capture: { ...prev.capture, ...patch } }));
  }, []);

  const advanceFromCapture = useCallback(() => {
    setState((prev) => ({ ...prev, ...advanceHistory(prev, 'reveal') }));
  }, []);

  const totalVisibleSteps = useMemo(() => visibleQuestions(state.answers).length, [state.answers]);
  const currentStepPosition = useMemo(() => {
    if (!currentQuestion) return null;
    return visibleQuestions(state.answers).findIndex((q) => q.id === currentQuestion.id) + 1;
  }, [currentQuestion, state.answers]);

  return {
    hydrated,
    sessionId: state.sessionId,
    answers: state.answers,
    capture: state.capture,
    currentScreen,
    currentQuestion,
    pillarPosition,
    canGoBack: state.historyIndex > 0,
    totalVisibleSteps,
    currentStepPosition,
    startedAt: state.startedAt,
    answerAndAdvance,
    updateCapture,
    advanceFromCapture,
    goBack,
  };
}

export type DiagnosticState = ReturnType<typeof useDiagnosticState>;
