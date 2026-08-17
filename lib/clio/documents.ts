/**
 * Clio Document Management: Upload evidence files attached to Matters.
 * Follows official Clio v4 3-step S3 document upload procedure.
 */

import { clioRequest, ClioApiError } from './client';
import { ClioDocument, UploadedFile } from '../types/dispute';

interface ClioDocumentCreateResponse {
  data: ClioDocument;
}

/**
 * Uploads a single evidence file to a Clio Matter.
 */
export async function uploadEvidenceDocument(
  matterId: number,
  file: UploadedFile
): Promise<ClioDocument> {
  // Step 1: Create Document placeholder and get S3 upload parameters
  const endpoint = `/documents.json?fields=id,name,latest_document_version{id,uuid,put_url,put_headers}`;

  const createPayload = {
    data: {
      name: file.filename,
      parent: {
        id: matterId,
        type: 'Matter',
      },
    },
  };

  const createRes = await clioRequest<ClioDocumentCreateResponse>(endpoint, {
    method: 'POST',
    body: createPayload,
  });

  const doc = createRes.data;
  const version = doc.latest_document_version;

  if (!version || !version.uuid || !version.put_url) {
    throw new ClioApiError(
      `Clio document creation succeeded but no upload URL returned for "${file.filename}".`,
      502
    );
  }

  // Step 2: Upload file binary to S3 using the provided put_url and put_headers
  const s3Headers: Record<string, string> = {
    'Content-Type': file.mimeType || 'application/octet-stream',
  };

  if (Array.isArray(version.put_headers)) {
    for (const h of version.put_headers) {
      s3Headers[h.name] = h.value;
    }
  }

  try {
    const s3Response = await fetch(version.put_url, {
      method: 'PUT',
      headers: s3Headers,
      body: file.buffer,
    });

    if (!s3Response.ok) {
      throw new ClioApiError(
        `Failed to upload file content for "${file.filename}" to Clio storage (status ${s3Response.status}).`,
        502
      );
    }
  } catch (err) {
    if (err instanceof ClioApiError) throw err;
    throw new ClioApiError(
      `S3 storage upload error for "${file.filename}": ${(err as Error).message}`,
      502
    );
  }

  // Step 3: Mark document version as fully_uploaded
  const patchEndpoint = `/documents/${doc.id}.json`;
  const patchPayload = {
    data: {
      uuid: version.uuid,
      fully_uploaded: true,
    },
  };

  await clioRequest(patchEndpoint, {
    method: 'PATCH',
    body: patchPayload,
  });

  return doc;
}

/**
 * Uploads all validated evidence files to the specified Clio Matter.
 */
export async function uploadAllEvidenceFiles(
  matterId: number,
  files: UploadedFile[]
): Promise<{ uploadedCount: number; errors: string[] }> {
  let uploadedCount = 0;
  const errors: string[] = [];

  for (const file of files) {
    try {
      await uploadEvidenceDocument(matterId, file);
      uploadedCount++;
    } catch (err) {
      const msg = (err as Error).message || 'Unknown upload error';
      console.error(`[Clio Documents] Failed to upload "${file.filename}":`, msg);
      errors.push(`${file.filename}: ${msg}`);
    }
  }

  return { uploadedCount, errors };
}
