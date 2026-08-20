import type { Option } from './types';

/** Ids match `diagnosticCompanySizeSchema` in `@pulse/shared/trpc/schemas/diagnostic.input`. */
export const COMPANY_SIZE_OPTIONS: Option[] = [
  { id: 'under-50', label: 'Under 50' },
  { id: '50-to-250', label: '50 to 250' },
  { id: '250-to-1000', label: '250 to 1,000' },
  { id: '1000-to-5000', label: '1,000 to 5,000' },
  { id: 'over-5000', label: 'Over 5,000' },
];

/** Ids match `diagnosticSectorSchema` in `@pulse/shared/trpc/schemas/diagnostic.input`. */
export const SECTOR_OPTIONS: Option[] = [
  { id: 'financial-services', label: 'Financial services' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'healthcare-life-sciences', label: 'Healthcare and life sciences' },
  { id: 'public-sector', label: 'Public sector' },
  { id: 'retail-consumer', label: 'Retail and consumer' },
  { id: 'manufacturing-industrial', label: 'Manufacturing and industrial' },
  { id: 'energy-utilities', label: 'Energy and utilities' },
  { id: 'technology-software', label: 'Technology and software' },
  { id: 'professional-services', label: 'Professional services' },
  { id: 'telecoms-media', label: 'Telecoms and media' },
  { id: 'transport-logistics', label: 'Transport and logistics' },
  { id: 'other', label: 'Other' },
];
