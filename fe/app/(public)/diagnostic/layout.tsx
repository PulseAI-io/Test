import { JetBrains_Mono, Sora } from 'next/font/google';
import type React from 'react';
import './diagnostic.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-diag-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-diag-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export default function DiagnosticLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`diag diag-sans ${sora.variable} ${jetbrainsMono.variable}`}>{children}</div>
  );
}
