/**
 * Server-side dispute intake validation logic.
 */

import { DisputeRawInput, ValidatedDisputeData } from '../types/dispute';

export interface ValidationResult {
  valid: boolean;
  data?: ValidatedDisputeData;
  errors?: Record<string, string>;
}

// RFC 5322 compliant regex for practical email validation
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Normalizes and strictly validates dates in YYYY-MM-DD or DD/MM/YYYY format.
 * Returns ISO YYYY-MM-DD string if valid, or null if invalid/impossible (e.g. 31/02/2026).
 */
export function normalizeAndValidateDate(rawDate: unknown): string | null {
  if (typeof rawDate !== 'string') return null;
  const trimmed = rawDate.trim();
  if (!trimmed) return null;

  let year: number;
  let month: number;
  let day: number;

  // Format 1: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10);
    day = parseInt(isoMatch[3], 10);
  } else {
    // Format 2: DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyMatch) {
      day = parseInt(dmyMatch[1], 10);
      month = parseInt(dmyMatch[2], 10);
      year = parseInt(dmyMatch[3], 10);
    } else {
      return null;
    }
  }

  // Basic range check
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Strict calendar validity check (e.g., handles leap years, February 29/30/31, 30-day months)
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  if (
    dateObj.getUTCFullYear() !== year ||
    dateObj.getUTCMonth() !== month - 1 ||
    dateObj.getUTCDate() !== day
  ) {
    return null;
  }

  // Format back to YYYY-MM-DD
  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Validates monetary amount in EUR.
 * Returns { eur: number, cents: number } or null if invalid/negative.
 */
export function parseAndValidateAmount(rawAmount: unknown): { eur: number; cents: number } | null {
  if (rawAmount === undefined || rawAmount === null || rawAmount === '') {
    return null;
  }

  const str = String(rawAmount).trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(str)) {
    return null;
  }

  const numericValue = parseFloat(str);
  if (isNaN(numericValue) || !isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  // Avoid floating-point arithmetic pitfalls by splitting parts
  const [whole, decimal = ''] = str.split('.');
  const wholeCents = parseInt(whole, 10) * 100;
  const decimalCents = parseInt((decimal + '00').substring(0, 2), 10);
  const totalCents = wholeCents + decimalCents;

  return {
    eur: totalCents / 100,
    cents: totalCents,
  };
}

/**
 * Helper to check boolean values from JSON or FormData strings
 */
function isConsentTrue(value: unknown): boolean {
  if (value === true || value === 'true' || value === '1' || value === 'on') {
    return true;
  }
  return false;
}

/**
 * Helper to safely extract string
 */
function cleanString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value).trim();
  }
  return '';
}

/**
 * Validates all dispute form submission fields according to Resolvo requirements.
 */
export function validateDisputeInput(input: DisputeRawInput): ValidationResult {
  const errors: Record<string, string> = {};

  // First Name
  const firstName = cleanString(input.firstName);
  if (!firstName) {
    errors.firstName = 'First name is required.';
  } else if (firstName.length > 100) {
    errors.firstName = 'First name cannot exceed 100 characters.';
  }

  // Last Name
  const lastName = cleanString(input.lastName);
  if (!lastName) {
    errors.lastName = 'Last name is required.';
  } else if (lastName.length > 100) {
    errors.lastName = 'Last name cannot exceed 100 characters.';
  }

  // Complainant Email
  const email = cleanString(input.complainantEmail);
  if (!email) {
    errors.complainantEmail = 'Complainant email is required.';
  } else if (email.length > 254) {
    errors.complainantEmail = 'Email address cannot exceed 254 characters.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.complainantEmail = 'A valid email address is required.';
  }

  // Street & House Number/Name
  const streetHouseNumber = cleanString(input.streetHouseNumber);
  if (!streetHouseNumber) {
    errors.streetHouseNumber = 'Street & house number is required.';
  } else if (streetHouseNumber.length > 255) {
    errors.streetHouseNumber = 'Street & house number cannot exceed 255 characters.';
  }

  // Town
  const town = cleanString(input.town);
  if (!town) {
    errors.town = 'Town is required.';
  } else if (town.length > 150) {
    errors.town = 'Town cannot exceed 150 characters.';
  }

  // Post Code
  const postCode = cleanString(input.postCode);
  if (!postCode) {
    errors.postCode = 'Post code is required.';
  } else if (postCode.length > 50) {
    errors.postCode = 'Post code cannot exceed 50 characters.';
  }

  // Country of Residence
  const countryOfResidence = cleanString(input.countryOfResidence);
  if (!countryOfResidence) {
    errors.countryOfResidence = 'Country of residence is required.';
  } else if (countryOfResidence.length > 100) {
    errors.countryOfResidence = 'Country of residence cannot exceed 100 characters.';
  }

  // Date of Incident
  const normalizedDate = normalizeAndValidateDate(input.dateOfIncident);
  if (!normalizedDate) {
    errors.dateOfIncident = 'A valid date of incident is required (YYYY-MM-DD or DD/MM/YYYY).';
  }

  // Operator
  const operator = cleanString(input.operator);
  if (!operator) {
    errors.operator = 'Operator is required.';
  } else if (operator.length > 255) {
    errors.operator = 'Operator name cannot exceed 255 characters.';
  }

  // Operator Reference / Account ID (Optional)
  let operatorReference: string | undefined = cleanString(input.operatorReference);
  if (operatorReference.length > 255) {
    errors.operatorReference = 'Operator reference cannot exceed 255 characters.';
  }
  if (!operatorReference) {
    operatorReference = undefined;
  }

  // Amount Claimed (in EUR)
  const amountParsed = parseAndValidateAmount(input.amountClaimedEur);
  if (!amountParsed) {
    errors.amountClaimedEur =
      'A valid, positive monetary amount in EUR is required (e.g. 1250.50).';
  }

  // Details of the Case (Preserve exact string content)
  const rawDetails = typeof input.caseDetails === 'string' ? input.caseDetails : '';
  const trimmedDetails = rawDetails.trim();
  if (!trimmedDetails) {
    errors.caseDetails = 'Please provide the details of the case.';
  } else if (trimmedDetails.length > 50000) {
    errors.caseDetails = 'Case details cannot exceed 50,000 characters.';
  }

  // Checkbox Confirmations
  const informationAccurate = isConsentTrue(input.informationAccurate);
  if (!informationAccurate) {
    errors.informationAccurate =
      'You must confirm that the information is accurate and true.';
  }

  const personalDataConsent = isConsentTrue(input.personalDataConsent);
  if (!personalDataConsent) {
    errors.personalDataConsent =
      'You must consent to Resolvo processing your personal data.';
  }

  const rulesAccepted = isConsentTrue(input.rulesAccepted);
  if (!rulesAccepted) {
    errors.rulesAccepted =
      'You must confirm that you have read and accepted the Resolvo Rules of Procedure.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    data: {
      firstName,
      lastName,
      complainantEmail: email,
      streetHouseNumber,
      town,
      postCode,
      countryOfResidence,
      dateOfIncident: normalizedDate!,
      operator,
      operatorReference,
      amountClaimedEur: amountParsed!.eur,
      amountClaimedCents: amountParsed!.cents,
      caseDetails: rawDetails, // Preserve original unmodified text
      informationAccurate: true,
      personalDataConsent: true,
      rulesAccepted: true,
      submittedAt: new Date().toISOString(),
    },
  };
}
