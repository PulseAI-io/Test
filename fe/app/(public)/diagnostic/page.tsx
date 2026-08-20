import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/sanity/cached-queries';
import { DiagnosticApp } from './diagnostic-app';

export const metadata: Metadata = buildPageMetadata(
  'Initiative blind spot diagnostic — Sygenti',
  'Fifteen questions about one initiative you are accountable for. A reading of where your sightlines fail, and three actions you can take this week.',
  '/diagnostic'
);

export default function DiagnosticPage() {
  return <DiagnosticApp />;
}
