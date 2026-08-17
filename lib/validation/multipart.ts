/**
 * Parser for multipart/form-data and application/json requests in Vercel Serverless Functions.
 */

import type { IncomingMessage } from 'http';
import busboy from 'busboy';
import { ParsedIntakeRequest, UploadedFile } from '../types/dispute';
import { sanitizeFilename } from './file-signature';

const MAX_TOTAL_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Parses incoming serverless request body into fields and uploaded files.
 */
export async function parseRequest(req: IncomingMessage): Promise<ParsedIntakeRequest> {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('application/json')) {
    return parseJsonBody(req);
  }

  if (contentType.includes('multipart/form-data')) {
    return parseMultipartBody(req);
  }

  // Handle urlencoded if sent
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const raw = await readStreamToBuffer(req);
    const params = new URLSearchParams(raw.toString('utf-8'));
    const fields: Record<string, string> = {};
    params.forEach((value, key) => {
      fields[key] = value;
    });
    return { fields, files: [] };
  }

  // Default fallback to JSON
  return parseJsonBody(req);
}

/**
 * Parses raw JSON body
 */
async function parseJsonBody(req: IncomingMessage): Promise<ParsedIntakeRequest> {
  // If req.body is already parsed by Vercel / Express middleware
  const maybeBody = (req as unknown as { body?: unknown }).body;
  if (maybeBody && typeof maybeBody === 'object') {
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(maybeBody as Record<string, unknown>)) {
      if (typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string') {
        fields[k] = String(v);
      }
    }
    return { fields, files: [] };
  }

  const rawBuffer = await readStreamToBuffer(req);
  if (!rawBuffer || rawBuffer.length === 0) {
    return { fields: {}, files: [] };
  }

  try {
    const parsed = JSON.parse(rawBuffer.toString('utf-8'));
    const fields: Record<string, string> = {};
    if (parsed && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string') {
          fields[k] = String(v);
        }
      }
    }
    return { fields, files: [] };
  } catch {
    return { fields: {}, files: [] };
  }
}

/**
 * Parses multipart/form-data using busboy streaming
 */
function parseMultipartBody(req: IncomingMessage): Promise<ParsedIntakeRequest> {
  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {};
    const files: UploadedFile[] = [];
    let totalBytes = 0;
    let limitExceeded = false;

    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per file
        files: 10,
        fields: 50,
      },
    });

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('file', (name, fileStream, info) => {
      const { filename, mimeType } = info;
      const chunks: Buffer[] = [];
      let fileSize = 0;

      fileStream.on('data', (chunk: Buffer) => {
        fileSize += chunk.length;
        totalBytes += chunk.length;

        if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
          limitExceeded = true;
        }

        chunks.push(chunk);
      });

      fileStream.on('end', () => {
        if (filename && chunks.length > 0) {
          const buffer = Buffer.concat(chunks);
          files.push({
            filename: sanitizeFilename(filename),
            mimeType,
            size: buffer.length,
            buffer,
          });
        }
      });
    });

    bb.on('error', (err) => {
      reject(err);
    });

    bb.on('finish', () => {
      if (limitExceeded) {
        // Handled by validation layer as well
      }
      resolve({ fields, files });
    });

    req.pipe(bb);
  });
}

function readStreamToBuffer(stream: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });
}
