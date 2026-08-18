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
 * Tries both Clio v4 regarding schemas to ensure compatibility across all Clio account configurations.
 */
export async function createDisputeNote(
  matterId: number,
  data: ValidatedDisputeData
): Promise<ClioNote | null> {
  const endpoint = `/notes.json?fields=id,subject,detail,date`;
  const todayIsoDate = new Date().toISOString().split('T')[0];
  const subject = `Dispute Intake Details - ${data.operator} (${data.dateOfIncident})`;
  const detail = formatDisputeNoteDetail(data);

  // Schema Attempt 1: regarding: { id, type: 'Matter' }
  try {
    const payload1 = {
      data: {
        subject,
        detail,
        date: todayIsoDate,
        regarding: {
          id: matterId,
          type: 'Matter',
        },
      },
    };
    const res1 = await clioRequest<ClioSingleNoteResponse>(endpoint, {
      method: 'POST',
      body: payload1,
    });
    return res1.data;
  } catch (err1) {
    console.warn('[Clio Notes] Schema 1 (regarding) error:', (err1 as Error).message);
  }

  // Schema Attempt 2: parent: { id, type: 'Matter' }
  try {
    const payload2 = {
      data: {
        subject,
        detail,
        date: todayIsoDate,
        parent: {
          id: matterId,
          type: 'Matter',
        },
      },
    };
    const res2 = await clioRequest<ClioSingleNoteResponse>(endpoint, {
      method: 'POST',
      body: payload2,
    });
    return res2.data;
  } catch (err2) {
    console.warn('[Clio Notes] Schema 2 (parent) error:', (err2 as Error).message);
  }

  // Schema Attempt 3: matter: { id }
  try {
    const payload3 = {
      data: {
        subject,
        detail,
        date: todayIsoDate,
        matter: {
          id: matterId,
        },
      },
    };
    const res3 = await clioRequest<ClioSingleNoteResponse>(endpoint, {
      method: 'POST',
      body: payload3,
    });
    return res3.data;
  } catch (err3) {
    console.error('[Clio Notes] Schema 3 (matter) error:', (err3 as Error).message);
  }

  return null;
}
