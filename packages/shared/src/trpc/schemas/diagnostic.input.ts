import { z } from 'zod';

/** Mirrors `Answer` in `@pulse/shared/diagnostic` — kept independent so the
 * wire schema doesn't need to import the pure logic module. */
export const diagnosticAnswerSchema = z.object({
  value: z.string().min(1).max(200),
  points: z.number().min(0).max(2).optional(),
});

export const diagnosticAnswersSchema = z.record(z.string(), diagnosticAnswerSchema);

export const diagnosticCompanySizeSchema = z.enum([
  'under-50',
  '50-to-250',
  '250-to-1000',
  '1000-to-5000',
  'over-5000',
]);

export const diagnosticSectorSchema = z.enum([
  'financial-services',
  'insurance',
  'healthcare-life-sciences',
  'public-sector',
  'retail-consumer',
  'manufacturing-industrial',
  'energy-utilities',
  'technology-software',
  'professional-services',
  'telecoms-media',
  'transport-logistics',
  'other',
]);

export const diagnosticContextSchema = z.object({
  referrer: z.string().max(2048).optional(),
  utm: z.record(z.string(), z.string()).optional(),
  device: z.enum(['mobile', 'desktop']).optional(),
});

export const diagnosticSaveProgressSchema = z.object({
  sessionId: z.string().min(1).max(100),
  answers: diagnosticAnswersSchema,
  lastQuestionId: z.string().max(10).optional(),
}).extend(diagnosticContextSchema.shape);

export type DiagnosticSaveProgressInput = z.infer<typeof diagnosticSaveProgressSchema>;

export const diagnosticCompleteSchema = z
  .object({
    sessionId: z.string().min(1).max(100),
    answers: diagnosticAnswersSchema,
    role: z.string().min(1, 'Role required').max(255),
    companySize: diagnosticCompanySizeSchema,
    sector: diagnosticSectorSchema,
    email: z.string().email('Valid email required').max(255).optional(),
    durationSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
  })
  .extend(diagnosticContextSchema.shape);

export type DiagnosticCompleteInput = z.infer<typeof diagnosticCompleteSchema>;

export const diagnosticEmailReadingSchema = z.object({
  sessionId: z.string().min(1).max(100),
  email: z.string().email('Valid email required').max(255),
});

export type DiagnosticEmailReadingInput = z.infer<typeof diagnosticEmailReadingSchema>;

export const diagnosticSubmitResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export type DiagnosticSubmitResult = z.infer<typeof diagnosticSubmitResultSchema>;
