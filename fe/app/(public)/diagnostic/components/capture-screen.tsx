'use client';

import {
  COMPANY_SIZE_OPTIONS,
  DIAGNOSTIC_COPY,
  isFreeEmailProvider,
  SECTOR_OPTIONS,
} from '@pulse/shared/diagnostic';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GATE_MODE } from '../lib/config';
import type { CaptureState } from '../lib/use-diagnostic-state';
import { OptionList } from './option-list';

interface CaptureScreenProps {
  capture: CaptureState;
  onChange: (patch: Partial<CaptureState>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function CaptureScreen({ capture, onChange, onContinue, onBack }: CaptureScreenProps) {
  const [touched, setTouched] = useState(false);

  const emailIsFreeProvider = useMemo(
    () => (capture.email.trim() ? isFreeEmailProvider(capture.email.trim()) : false),
    [capture.email]
  );

  const emailLooksValid = capture.email.trim() === '' || /\S+@\S+\.\S+/.test(capture.email.trim());
  const requiredFieldsFilled = capture.role.trim() && capture.companySize && capture.sector;
  const emailRequirementMet = GATE_MODE === 'soft' || capture.email.trim() !== '';
  const canContinue = Boolean(requiredFieldsFilled) && emailLooksValid && emailRequirementMet;

  return (
    <div className="diag-question-enter flex flex-1 flex-col gap-6 px-5 py-8 sm:px-10 sm:py-12">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to the previous question"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink2)] hover:bg-[var(--alt)] focus-visible:outline focus-visible:outline-2"
          style={{ outlineColor: 'var(--teal)' }}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="diag-mono text-xs uppercase tracking-[0.08em] text-[color:var(--mut)]">
          Before your reading
        </p>
      </div>

      <h1 className="diag-question max-w-2xl text-2xl leading-snug text-[var(--ink)] sm:text-3xl">
        {DIAGNOSTIC_COPY.captureHeading}
      </h1>
      <p className="max-w-xl text-sm text-[color:var(--mut)]">{DIAGNOSTIC_COPY.captureBody}</p>

      <div className="flex max-w-xl flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="diag-mono text-xs uppercase tracking-[0.06em] text-[color:var(--mut)]">
            Role or title
          </span>
          <input
            type="text"
            value={capture.role}
            onChange={(event) => onChange({ role: event.target.value })}
            required
            className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 text-base text-[var(--ink)] outline-none focus-visible:border-[var(--teal)]"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="diag-mono mb-2 text-xs uppercase tracking-[0.06em] text-[color:var(--mut)]">
            Company size
          </legend>
          <OptionList
            legend="Company size"
            options={COMPANY_SIZE_OPTIONS}
            selectedId={capture.companySize}
            onSelect={(id) => onChange({ companySize: id })}
          />
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className="diag-mono text-xs uppercase tracking-[0.06em] text-[color:var(--mut)]">
            Sector
          </span>
          <select
            value={capture.sector}
            onChange={(event) => onChange({ sector: event.target.value })}
            required
            className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 text-base text-[var(--ink)] outline-none focus-visible:border-[var(--teal)]"
          >
            <option value="" disabled>
              Choose one
            </option>
            {SECTOR_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="diag-mono text-xs uppercase tracking-[0.06em] text-[color:var(--mut)]">
            Work email{GATE_MODE === 'soft' ? ' (optional)' : ''}
          </span>
          <input
            type="email"
            value={capture.email}
            onChange={(event) => onChange({ email: event.target.value })}
            onBlur={() => setTouched(true)}
            className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 text-base text-[var(--ink)] outline-none focus-visible:border-[var(--teal)]"
          />
          {touched && emailIsFreeProvider && (
            <p className="text-xs text-[color:var(--amb)]">
              {DIAGNOSTIC_COPY.freeEmailProviderNudge}
            </p>
          )}
        </label>

        <p className="text-xs text-[color:var(--mut)]">{DIAGNOSTIC_COPY.privacyLine}</p>

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="min-h-12 self-start rounded-xl bg-[var(--teal)] px-6 text-base font-medium text-white transition-opacity disabled:opacity-40"
        >
          See my reading
        </button>
      </div>
    </div>
  );
}
