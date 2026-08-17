/**
 * Vercel Serverless API Endpoint: POST /api/clio/intake
 *
 * Receives Resolvo dispute submission form data (multipart/form-data or JSON),
 * validates all fields and consents server-side, searches or creates a Clio Contact,
 * creates a Clio Matter, writes a comprehensive Matter Note, and uploads evidence files.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseRequest } from '../../lib/validation/multipart';
import { validateDisputeInput } from '../../lib/validation/dispute';
import { validateEvidenceBatch } from '../../lib/validation/file-signature';
import { findOrCreateContact } from '../../lib/clio/contacts';
import { createMatter } from '../../lib/clio/matters';
import { createDisputeNote } from '../../lib/clio/notes';
import { uploadAllEvidenceFiles } from '../../lib/clio/documents';
import { ClioApiError } from '../../lib/clio/client';

export const config = {
  api: {
    bodyParser: false, // Required for busboy streaming of multipart/form-data
  },
};

function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  const origin = req.headers.origin || '';

  if (allowedOrigin === '*' || origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Handle CORS preflight
  if (setCorsHeaders(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.',
    });
    return;
  }

  try {
    // 1. Parse Request Body & Multipart Files
    let parsed;
    try {
      parsed = await parseRequest(req);
    } catch (parseErr) {
      res.status(400).json({
        success: false,
        error: `Failed to parse request payload: ${(parseErr as Error).message}`,
      });
      return;
    }

    // 2. Validate Form Fields & Confirmation Checkboxes
    const validation = validateDisputeInput(parsed.fields);
    if (!validation.valid || !validation.data) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        fields: validation.errors,
      });
      return;
    }

    const validatedData = validation.data;

    // 3. Validate Evidence Uploads (MIME types, Magic Bytes, 5MB/10MB limits)
    if (parsed.files && parsed.files.length > 0) {
      const fileValidation = validateEvidenceBatch(parsed.files);
      if (!fileValidation.valid) {
        res.status(400).json({
          success: false,
          error: fileValidation.error || 'Invalid evidence file provided.',
        });
        return;
      }
    }

    // 4. Clio Integration: Find or Create Contact
    const { contact } = await findOrCreateContact(validatedData);

    // 5. Clio Integration: Create Matter
    const matter = await createMatter(contact.id, validatedData);

    // 6. Clio Integration: Create Dispute & Consent Note
    await createDisputeNote(matter.id, validatedData);

    // 7. Clio Integration: Upload Evidence Files (if provided)
    let uploadedCount = 0;
    if (parsed.files && parsed.files.length > 0) {
      const uploadResult = await uploadAllEvidenceFiles(matter.id, parsed.files);
      uploadedCount = uploadResult.uploadedCount;
    }

    // 8. Return Clean Success Response
    res.status(200).json({
      success: true,
      contact: {
        id: contact.id,
      },
      matter: {
        id: matter.id,
      },
      evidenceUploaded: uploadedCount,
    });
  } catch (error) {
    if (error instanceof ClioApiError) {
      console.error(`[Clio API Error] Status ${error.statusCode}:`, error.message);

      if (error.statusCode === 401) {
        res.status(401).json({
          success: false,
          error: 'Clio authentication failed. Please check your credentials.',
        });
        return;
      }

      if (error.statusCode === 403) {
        res.status(403).json({
          success: false,
          error: 'Clio permission denied. Required OAuth scopes are missing.',
        });
        return;
      }

      if (error.statusCode === 404) {
        res.status(404).json({
          success: false,
          error: 'Clio resource not found.',
        });
        return;
      }

      if (error.statusCode === 429) {
        res.status(429).json({
          success: false,
          error: 'Clio API rate limit reached. Please retry in a few moments.',
        });
        return;
      }

      res.status(502).json({
        success: false,
        error: 'Unable to create the dispute in Clio. Downstream service returned an error.',
      });
      return;
    }

    // Unknown Server Error
    console.error('[Internal Error]:', (error as Error).message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing the dispute submission.',
    });
  }
}
