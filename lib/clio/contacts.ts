/**
 * Clio Contact management: Search and Create
 */

import { clioRequest } from './client';
import { ClioContact, ValidatedDisputeData } from '../types/dispute';

interface ClioContactsResponse {
  data: ClioContact[];
}

interface ClioSingleContactResponse {
  data: ClioContact;
}

/**
 * Searches for an existing Person Contact by email address.
 */
export async function findContactByEmail(email: string): Promise<ClioContact | null> {
  const encodedEmail = encodeURIComponent(email.trim());
  const endpoint = `/contacts.json?type=Person&query=${encodedEmail}&fields=id,name,first_name,last_name,email_addresses{address}`;

  try {
    const response = await clioRequest<ClioContactsResponse>(endpoint);
    if (response && response.data && response.data.length > 0) {
      // Find exact email match if multiple results returned by search
      const exactMatch = response.data.find((contact) =>
        contact.email_addresses?.some(
          (e) => e.address.toLowerCase() === email.trim().toLowerCase()
        )
      );
      return exactMatch || response.data[0];
    }
  } catch (err) {
    console.error('[Clio Contacts] Error searching contact by email:', (err as Error).message);
    throw err;
  }

  return null;
}

/**
 * Creates a new Person Contact in Clio Manage.
 */
export async function createContact(data: ValidatedDisputeData): Promise<ClioContact> {
  const endpoint = `/contacts.json?fields=id,name,first_name,last_name,email_addresses,addresses`;

  const payload = {
    data: {
      type: 'Person',
      first_name: data.firstName,
      last_name: data.lastName,
      email_addresses: [
        {
          name: 'Work',
          address: data.complainantEmail,
          default_email: true,
        },
      ],
      addresses: [
        {
          name: 'Home',
          street: data.streetHouseNumber,
          city: data.town,
          postal_code: data.postCode,
          country: data.countryOfResidence,
          primary: true,
        },
      ],
    },
  };

  const response = await clioRequest<ClioSingleContactResponse>(endpoint, {
    method: 'POST',
    body: payload,
  });

  return response.data;
}

/**
 * Finds an existing contact by email or creates a new one.
 */
export async function findOrCreateContact(
  data: ValidatedDisputeData
): Promise<{ contact: ClioContact; created: boolean }> {
  const existing = await findContactByEmail(data.complainantEmail);
  if (existing) {
    return { contact: existing, created: false };
  }

  const created = await createContact(data);
  return { contact: created, created: true };
}
