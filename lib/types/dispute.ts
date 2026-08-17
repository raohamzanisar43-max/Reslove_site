/**
 * TypeScript types for Resolvo Dispute Submission & Clio Manage API Integration
 */

export interface DisputeRawInput {
  firstName?: unknown;
  lastName?: unknown;
  complainantEmail?: unknown;
  streetHouseNumber?: unknown;
  town?: unknown;
  postCode?: unknown;
  countryOfResidence?: unknown;
  dateOfIncident?: unknown;
  operator?: unknown;
  operatorReference?: unknown;
  amountClaimedEur?: unknown;
  caseDetails?: unknown;
  informationAccurate?: unknown;
  personalDataConsent?: unknown;
  rulesAccepted?: unknown;
}

export interface ValidatedDisputeData {
  firstName: string;
  lastName: string;
  complainantEmail: string;
  streetHouseNumber: string;
  town: string;
  postCode: string;
  countryOfResidence: string;
  dateOfIncident: string; // YYYY-MM-DD
  operator: string;
  operatorReference?: string;
  amountClaimedEur: number; // Decimal EUR representation e.g. 1250.50
  amountClaimedCents: number; // Safe integer cents e.g. 125050
  caseDetails: string;
  informationAccurate: boolean;
  personalDataConsent: boolean;
  rulesAccepted: boolean;
  submittedAt: string; // ISO 8601 string
}

export interface UploadedFile {
  filename: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface ParsedIntakeRequest {
  fields: Record<string, string>;
  files: UploadedFile[];
}

export interface ValidationErrorResponse {
  success: false;
  error: string;
  fields?: Record<string, string>;
}

export interface SuccessResponse {
  success: true;
  contact: {
    id: number | string;
  };
  matter: {
    id: number | string;
  };
  evidenceUploaded?: number;
}

export type ApiResponse = SuccessResponse | ValidationErrorResponse;

// Clio Entity Types
export interface ClioContactEmail {
  name: string;
  address: string;
  default_email?: boolean;
}

export interface ClioContactAddress {
  name?: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  primary?: boolean;
}

export interface ClioContact {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  type?: 'Person' | 'Company';
  email_addresses?: ClioContactEmail[];
  addresses?: ClioContactAddress[];
}

export interface ClioMatter {
  id: number;
  display_number?: string;
  description?: string;
  status?: string;
  client?: {
    id: number;
    name?: string;
  };
}

export interface ClioNote {
  id: number;
  subject: string;
  detail: string;
  date?: string;
}

export interface ClioDocumentVersion {
  id?: number;
  uuid: string;
  put_url?: string;
  put_headers?: Array<{ name: string; value: string }>;
}

export interface ClioDocument {
  id: number;
  latest_document_version?: ClioDocumentVersion;
}
