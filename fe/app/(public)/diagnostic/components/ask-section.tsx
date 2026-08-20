'use client';

import { DIAGNOSTIC_COPY, type RevealResult } from '@pulse/shared/diagnostic';
import { Check, Copy, Mail } from 'lucide-react';
import { useState } from 'react';
import { bookingUrl } from '../lib/config';
import { revealToPlainText } from '../lib/copy-as-text';
import { emailReading } from '../lib/submit';

interface AskSectionProps {
  result: RevealResult;
  sessionId: string;
  emailAlreadyCaptured: boolean;
}

export function AskSection({ result, sessionId, emailAlreadyCaptured }: AskSectionProps) {
  const [copied, setCopied] = useState(false);
  const [emailPromptOpen, setEmailPromptOpen] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(revealToPlainText(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the text is still selectable on the page.
    }
  };

  const handleSendEmail = async () => {
    if (!emailValue.trim()) return;
    setEmailStatus('sending');
    const success = await emailReading(sessionId, emailValue.trim());
    setEmailStatus(success ? 'sent' : 'error');
  };

  return (
    <div className="flex flex-col gap-6 border-t border-[var(--line)] pt-10">
      <div>
        <h2 className="diag-question text-2xl text-[var(--ink)]">{DIAGNOSTIC_COPY.askHeading}</h2>
        <p className="mt-2 max-w-xl text-sm text-[color:var(--ink2)]">{DIAGNOSTIC_COPY.askBody}</p>
      </div>

      <a
        href={bookingUrl()}
        className="inline-flex min-h-12 w-fit items-center justify-center rounded-xl bg-[var(--teal)] px-6 text-base font-medium text-white"
      >
        {DIAGNOSTIC_COPY.bookButtonLabel}
      </a>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-4 text-sm text-[var(--ink2)] hover:bg-[var(--alt)]"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? 'Copied' : DIAGNOSTIC_COPY.copyAsTextLabel}
        </button>

        {!emailAlreadyCaptured &&
          emailStatus !== 'sent' &&
          (!emailPromptOpen ? (
            <button
              type="button"
              onClick={() => setEmailPromptOpen(true)}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] px-4 text-sm text-[var(--ink2)] hover:bg-[var(--alt)]"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {DIAGNOSTIC_COPY.emailMeLabel}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={emailValue}
                onChange={(event) => setEmailValue(event.target.value)}
                placeholder="you@company.com"
                className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 text-sm text-[var(--ink)] outline-none focus-visible:border-[var(--teal)]"
              />
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={emailStatus === 'sending'}
                className="min-h-12 rounded-xl bg-[var(--teal)] px-4 text-sm font-medium text-white disabled:opacity-50"
              >
                {emailStatus === 'sending' ? 'Sending...' : 'Send'}
              </button>
            </div>
          ))}
        {emailStatus === 'sent' && (
          <span className="text-sm text-[var(--teal)]">Sent. Check your inbox.</span>
        )}
        {emailStatus === 'error' && (
          <span className="text-sm text-[var(--red)]">Could not send. Please try again.</span>
        )}
      </div>

      <p className="text-xs text-[color:var(--mut)]">{DIAGNOSTIC_COPY.privacyLine}</p>
    </div>
  );
}
