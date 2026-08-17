/**
 * Clio Notes management: Records dispute details and consent records as a Matter Note.
 */

import { clioRequest } from './client';
import { ClioNote, ValidatedDisputeData } from '../types/dispute';

interface ClioSingleNoteResponse {
  data: ClioNote;
}

/**
 * Formats structured dispute details and consent audit trail into a clean note body.
 */
export function formatDisputeNoteDetail(data: ValidatedDisputeData): string {
  const accountRefLine = data.operatorReference
    ? `• Operator Reference / Account ID: ${data.operatorReference}`
    : '• Operator Reference / Account ID: Not provided';

  return `
=== RESOLVO DISPUTE INTAKE SUBMISSION ===

COMPLAINANT INFORMATION:
• Name: ${data.firstName} ${data.lastName}
• Email: ${data.complainantEmail}
• Street & House Number: ${data.streetHouseNumber}
• Town / City: ${data.town}
• Post Code: ${data.postCode}
• Country of Residence: ${data.countryOfResidence}

DISPUTE METADATA:
• Date of Incident: ${data.dateOfIncident}
• Operator: ${data.operator}
${accountRefLine}
• Amount Claimed (EUR): €${data.amountClaimedEur.toFixed(2)} (${data.amountClaimedCents} cents)
• Submission Timestamp: ${data.submittedAt}

CASE DETAILS (UNMODIFIED SUBMISSION):
--------------------------------------------------
${data.caseDetails}
--------------------------------------------------

CONSENT & CONFIRMATION AUDIT TRAIL:
[✓] Accuracy Declaration: Confirmed by complainant (${data.submittedAt})
    "Information is accurate and true, and claim has not been submitted to another ADR or Court."
[✓] Personal Data Consent: Confirmed by complainant (${data.submittedAt})
    "Consents to Resolvo processing personal data and accessing operator/GCB data under Privacy Policy."
[✓] Rules Acceptance: Confirmed by complainant (${data.submittedAt})
    "Confirmed reading, understanding, and accepting Resolvo Rules of Procedure."
`.trim();
}

/**
 * Creates a note on the Clio Matter containing the dispute details and consent confirmations.
 */
export async function createDisputeNote(
  matterId: number,
  data: ValidatedDisputeData
): Promise<ClioNote | null> {
  const endpoint = `/notes.json?type=matter&fields=id,subject,detail,date`;
  const todayIsoDate = new Date().toISOString().split('T')[0];

  const payload = {
    data: {
      type: 'Matter',
      subject: `Dispute Intake Details - ${data.operator} (${data.dateOfIncident})`,
      detail: formatDisputeNoteDetail(data),
      date: todayIsoDate,
      regarding: {
        id: matterId,
        type: 'Matter',
      },
      matter: {
        id: matterId,
      },
    },
  };

  try {
    const response = await clioRequest<ClioSingleNoteResponse>(endpoint, {
      method: 'POST',
      body: payload,
    });
    return response.data;
  } catch (err) {
    console.warn('[Clio Notes Warning] Primary note creation endpoint warning, trying fallback:', (err as Error).message);
    // Fallback without type in query
    try {
      const fallbackRes = await clioRequest<ClioSingleNoteResponse>(`/notes.json?fields=id,subject,detail,date`, {
        method: 'POST',
        body: payload,
      });
      return fallbackRes.data;
    } catch (fallbackErr) {
      console.error('[Clio Notes Error] Note creation fallback error:', (fallbackErr as Error).message);
      return null;
    }
  }
}
