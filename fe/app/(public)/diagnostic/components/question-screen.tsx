'use client';

import type { AnswerMap, Question } from '@pulse/shared/diagnostic';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { OptionList } from './option-list';
import { ProgressEyebrow } from './progress-eyebrow';

interface QuestionScreenProps {
  question: Question;
  answers: AnswerMap;
  pillarPosition: {
    pillar: 'organisation' | 'team' | 'self';
    position: number;
    total: number;
  } | null;
  canGoBack: boolean;
  onBack: () => void;
  onAnswer: (value: string, points?: number) => void;
}

export function QuestionScreen({
  question,
  answers,
  pillarPosition,
  canGoBack,
  onBack,
  onAnswer,
}: QuestionScreenProps) {
  return (
    <div
      key={question.id}
      className="diag-question-enter flex flex-1 flex-col gap-6 px-5 py-8 sm:px-10 sm:py-12"
    >
      <div className="flex items-center gap-4">
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to the previous question"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink2)] hover:bg-[var(--alt)] focus-visible:outline focus-visible:outline-2"
            style={{ outlineColor: 'var(--teal)' }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <ProgressEyebrow
          pillarPosition={pillarPosition}
          fallbackLabel={question.kind === 'text' ? 'Your initiative' : 'About the initiative'}
        />
      </div>

      {question.kind === 'scored' && (
        <p className="diag-mono max-w-2xl text-xs uppercase tracking-[0.06em] text-[color:var(--mut)]">
          {question.eyebrow}
        </p>
      )}

      <h1 className="diag-question max-w-2xl text-2xl leading-snug text-[var(--ink)] sm:text-3xl">
        {question.prompt}
      </h1>

      {question.helper && (
        <p className="max-w-xl text-sm text-[color:var(--mut)]">{question.helper}</p>
      )}

      <div className="max-w-xl">
        {question.kind === 'text' ? (
          <FreeTextInput
            question={question}
            initialValue={answers[question.id]?.value}
            onSubmit={onAnswer}
          />
        ) : (
          <OptionList
            legend={question.prompt}
            options={question.options}
            selectedId={answers[question.id]?.value}
            onSelect={(optionId) => {
              const points =
                question.kind === 'scored'
                  ? question.options.find((o) => o.id === optionId)?.points
                  : undefined;
              onAnswer(optionId, points);
            }}
          />
        )}
      </div>
    </div>
  );
}

function FreeTextInput({
  question,
  initialValue,
  onSubmit,
}: {
  question: Question & { kind: 'text' };
  initialValue?: string;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue ?? '');
  const trimmed = value.trim();

  const submit = () => {
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value.slice(0, question.maxLength))}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        maxLength={question.maxLength}
        rows={3}
        aria-label={question.prompt}
        placeholder="One sentence is enough."
        className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--card)] p-4 text-lg text-[var(--ink)] outline-none focus-visible:border-[var(--teal)]"
      />
      <div className="flex items-center justify-between">
        <span className="diag-mono text-xs text-[color:var(--mut)]">
          {trimmed.length}/{question.maxLength}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={!trimmed}
          className="min-h-12 rounded-xl bg-[var(--teal)] px-6 text-base font-medium text-white transition-opacity disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
