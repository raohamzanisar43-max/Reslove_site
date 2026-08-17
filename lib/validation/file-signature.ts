/**
 * File validation and Magic Number (signature) checks for evidence uploads.
 * Supported file types: JPEG, PNG, GIF
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif']);

/**
 * Detects MIME type from buffer magic numbers (signatures)
 */
export function detectMimeType(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 4) {
    return null;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 (0x89 'P' 'N' 'G')
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  // GIF: GIF87a or GIF89a (47 49 46 38)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return 'image/gif';
  }

  return null;
}

/**
 * Sanitizes a filename to prevent directory traversal and unsafe characters.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'evidence_file';
  // Strip paths
  const base = filename.replace(/^.*[\\/]/, '');
  // Keep only alphanumeric, dots, dashes, underscores
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Avoid leading dots or empty
  return clean.replace(/^\.+/, '') || 'evidence_file';
}

/**
 * Validates a single evidence file.
 */
export function validateEvidenceFile(file: {
  filename: string;
  buffer: Buffer;
  size?: number;
}): FileValidationResult {
  const size = file.size ?? file.buffer.length;

  if (size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Evidence file "${file.filename}" exceeds the 5 MB per-file limit (${(size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: `Evidence file "${file.filename}" is empty.`,
    };
  }

  const extMatch = file.filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = extMatch ? extMatch[1] : '';

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension for "${file.filename}". Only jpg, jpeg, png, and gif are accepted.`,
    };
  }

  const detectedMime = detectMimeType(file.buffer);
  if (!detectedMime) {
    return {
      valid: false,
      error: `Invalid file content for "${file.filename}". File signature does not match any allowed image type (JPEG, PNG, GIF).`,
    };
  }

  // Check matching extension and MIME
  if (
    (ext === 'png' && detectedMime !== 'image/png') ||
    ((ext === 'jpg' || ext === 'jpeg') && detectedMime !== 'image/jpeg') ||
    (ext === 'gif' && detectedMime !== 'image/gif')
  ) {
    return {
      valid: false,
      error: `File signature mismatch for "${file.filename}". Extension .${ext} does not match actual image type ${detectedMime}.`,
    };
  }

  return {
    valid: true,
    detectedMime,
  };
}

/**
 * Validates the entire list of uploaded files against per-file and total size limits.
 */
export function validateEvidenceBatch(
  files: Array<{ filename: string; buffer: Buffer; size?: number }>
): { valid: boolean; error?: string } {
  let totalSize = 0;

  for (const file of files) {
    const size = file.size ?? file.buffer.length;
    totalSize += size;

    const singleCheck = validateEvidenceFile(file);
    if (!singleCheck.valid) {
      return singleCheck;
    }
  }

  if (totalSize > MAX_TOTAL_SIZE_BYTES) {
    return {
      valid: false,
      error: `Total evidence upload exceeds the 10 MB limit (${(totalSize / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  return { valid: true };
}
