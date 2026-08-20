const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'live.com',
  'msn.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'gmx.com',
  'yandex.com',
  'zoho.com',
  'me.com',
]);

/** True for well-known free/consumer email providers — used for the soft work-email nudge. */
export function isFreeEmailProvider(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1];
  return domain ? FREE_EMAIL_PROVIDERS.has(domain) : false;
}
