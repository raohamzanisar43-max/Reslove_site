/**
 * Clio Matter management: Creation and client association.
 */

import { clioRequest } from './client';
import { ClioMatter, ValidatedDisputeData } from '../types/dispute';

interface ClioSingleMatterResponse {
  data: ClioMatter;
}

/**
 * Creates a new Matter in Clio associated with the complainant Contact.
 */
export async function createMatter(
  contactId: number,
  data: ValidatedDisputeData
): Promise<ClioMatter> {
  const endpoint = `/matters.json?fields=id,display_number,description,status,client{id,name}`;
  const todayIsoDate = new Date().toISOString().split('T')[0];

  const payload = {
    data: {
      client: {
        id: contactId,
      },
      description: `Resolvo Dispute - ${data.firstName} ${data.lastName} | Operator: ${data.operator} | Claim: €${data.amountClaimedEur.toFixed(2)} | Date: ${data.dateOfIncident}`,
      status: 'Open',
      open_date: todayIsoDate,
      client_reference: data.operatorReference || `DISPUTE-${data.operator}`,
    },
  };

  const response = await clioRequest<ClioSingleMatterResponse>(endpoint, {
    method: 'POST',
    body: payload,
  });

  return response.data;
}
