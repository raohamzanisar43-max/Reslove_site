// lib/validation/multipart.ts
import busboy from "busboy";

// lib/validation/file-signature.ts
var MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
var MAX_TOTAL_SIZE_BYTES = 10 * 1024 * 1024;
var ALLOWED_EXTENSIONS = /* @__PURE__ */ new Set(["jpg", "jpeg", "png", "gif"]);
function detectMimeType(buffer) {
  if (!buffer || buffer.length < 4) {
    return null;
  }
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
    return "image/jpeg";
  }
  if (buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71) {
    return "image/png";
  }
  if (buffer[0] === 71 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 56) {
    return "image/gif";
  }
  return null;
}
function sanitizeFilename(filename) {
  if (!filename) return "evidence_file";
  const base = filename.replace(/^.*[\\/]/, "");
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return clean.replace(/^\.+/, "") || "evidence_file";
}
function validateEvidenceFile(file) {
  const size = file.size ?? file.buffer.length;
  if (size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Evidence file "${file.filename}" exceeds the 5 MB per-file limit (${(size / (1024 * 1024)).toFixed(2)} MB).`
    };
  }
  if (size === 0) {
    return {
      valid: false,
      error: `Evidence file "${file.filename}" is empty.`
    };
  }
  const extMatch = file.filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = extMatch ? extMatch[1] : "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension for "${file.filename}". Only jpg, jpeg, png, and gif are accepted.`
    };
  }
  const detectedMime = detectMimeType(file.buffer);
  if (!detectedMime) {
    return {
      valid: false,
      error: `Invalid file content for "${file.filename}". File signature does not match any allowed image type (JPEG, PNG, GIF).`
    };
  }
  if (ext === "png" && detectedMime !== "image/png" || (ext === "jpg" || ext === "jpeg") && detectedMime !== "image/jpeg" || ext === "gif" && detectedMime !== "image/gif") {
    return {
      valid: false,
      error: `File signature mismatch for "${file.filename}". Extension .${ext} does not match actual image type ${detectedMime}.`
    };
  }
  return {
    valid: true,
    detectedMime
  };
}
function validateEvidenceBatch(files) {
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
      error: `Total evidence upload exceeds the 10 MB limit (${(totalSize / (1024 * 1024)).toFixed(2)} MB).`
    };
  }
  return { valid: true };
}

// lib/validation/multipart.ts
var MAX_TOTAL_UPLOAD_BYTES = 10 * 1024 * 1024;
async function parseRequest(req) {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("application/json")) {
    return parseJsonBody(req);
  }
  if (contentType.includes("multipart/form-data")) {
    return parseMultipartBody(req);
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const raw = await readStreamToBuffer(req);
    const params = new URLSearchParams(raw.toString("utf-8"));
    const fields = {};
    params.forEach((value, key) => {
      fields[key] = value;
    });
    return { fields, files: [] };
  }
  return parseJsonBody(req);
}
async function parseJsonBody(req) {
  const maybeBody = req.body;
  if (maybeBody && typeof maybeBody === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(maybeBody)) {
      if (typeof v === "boolean" || typeof v === "number" || typeof v === "string") {
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
    const parsed = JSON.parse(rawBuffer.toString("utf-8"));
    const fields = {};
    if (parsed && typeof parsed === "object") {
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "boolean" || typeof v === "number" || typeof v === "string") {
          fields[k] = String(v);
        }
      }
    }
    return { fields, files: [] };
  } catch {
    return { fields: {}, files: [] };
  }
}
function parseMultipartBody(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    let totalBytes = 0;
    let limitExceeded = false;
    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: 5 * 1024 * 1024,
        // 5 MB per file
        files: 10,
        fields: 50
      }
    });
    bb.on("field", (name, val) => {
      fields[name] = val;
    });
    bb.on("file", (name, fileStream, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      let fileSize = 0;
      fileStream.on("data", (chunk) => {
        fileSize += chunk.length;
        totalBytes += chunk.length;
        if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
          limitExceeded = true;
        }
        chunks.push(chunk);
      });
      fileStream.on("end", () => {
        if (filename && chunks.length > 0) {
          const buffer = Buffer.concat(chunks);
          files.push({
            filename: sanitizeFilename(filename),
            mimeType,
            size: buffer.length,
            buffer
          });
        }
      });
    });
    bb.on("error", (err) => {
      reject(err);
    });
    bb.on("finish", () => {
      if (limitExceeded) {
      }
      resolve({ fields, files });
    });
    req.pipe(bb);
  });
}
function readStreamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

// lib/validation/dispute.ts
var EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
function normalizeAndValidateDate(rawDate) {
  if (typeof rawDate !== "string") return null;
  const trimmed = rawDate.trim();
  if (!trimmed) return null;
  let year;
  let month;
  let day;
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10);
    day = parseInt(isoMatch[3], 10);
  } else {
    const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyMatch) {
      day = parseInt(dmyMatch[1], 10);
      month = parseInt(dmyMatch[2], 10);
      year = parseInt(dmyMatch[3], 10);
    } else {
      return null;
    }
  }
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  if (dateObj.getUTCFullYear() !== year || dateObj.getUTCMonth() !== month - 1 || dateObj.getUTCDate() !== day) {
    return null;
  }
  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function parseAndValidateAmount(rawAmount) {
  if (rawAmount === void 0 || rawAmount === null || rawAmount === "") {
    return null;
  }
  const str = String(rawAmount).trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(str)) {
    return null;
  }
  const numericValue = parseFloat(str);
  if (isNaN(numericValue) || !isFinite(numericValue) || numericValue <= 0) {
    return null;
  }
  const [whole, decimal = ""] = str.split(".");
  const wholeCents = parseInt(whole, 10) * 100;
  const decimalCents = parseInt((decimal + "00").substring(0, 2), 10);
  const totalCents = wholeCents + decimalCents;
  return {
    eur: totalCents / 100,
    cents: totalCents
  };
}
function isConsentTrue(value) {
  if (value === true || value === "true" || value === "1" || value === "on") {
    return true;
  }
  return false;
}
function cleanString(value) {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return String(value).trim();
  }
  return "";
}
function validateDisputeInput(input) {
  const errors = {};
  const firstName = cleanString(input.firstName);
  if (!firstName) {
    errors.firstName = "First name is required.";
  } else if (firstName.length > 100) {
    errors.firstName = "First name cannot exceed 100 characters.";
  }
  const lastName = cleanString(input.lastName);
  if (!lastName) {
    errors.lastName = "Last name is required.";
  } else if (lastName.length > 100) {
    errors.lastName = "Last name cannot exceed 100 characters.";
  }
  const email = cleanString(input.complainantEmail);
  if (!email) {
    errors.complainantEmail = "Complainant email is required.";
  } else if (email.length > 254) {
    errors.complainantEmail = "Email address cannot exceed 254 characters.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.complainantEmail = "A valid email address is required.";
  }
  const streetHouseNumber = cleanString(input.streetHouseNumber);
  if (!streetHouseNumber) {
    errors.streetHouseNumber = "Street & house number is required.";
  } else if (streetHouseNumber.length > 255) {
    errors.streetHouseNumber = "Street & house number cannot exceed 255 characters.";
  }
  const town = cleanString(input.town);
  if (!town) {
    errors.town = "Town is required.";
  } else if (town.length > 150) {
    errors.town = "Town cannot exceed 150 characters.";
  }
  const postCode = cleanString(input.postCode);
  if (!postCode) {
    errors.postCode = "Post code is required.";
  } else if (postCode.length > 50) {
    errors.postCode = "Post code cannot exceed 50 characters.";
  }
  const countryOfResidence = cleanString(input.countryOfResidence);
  if (!countryOfResidence) {
    errors.countryOfResidence = "Country of residence is required.";
  } else if (countryOfResidence.length > 100) {
    errors.countryOfResidence = "Country of residence cannot exceed 100 characters.";
  }
  const normalizedDate = normalizeAndValidateDate(input.dateOfIncident);
  if (!normalizedDate) {
    errors.dateOfIncident = "A valid date of incident is required (YYYY-MM-DD or DD/MM/YYYY).";
  }
  const operator = cleanString(input.operator);
  if (!operator) {
    errors.operator = "Operator is required.";
  } else if (operator.length > 255) {
    errors.operator = "Operator name cannot exceed 255 characters.";
  }
  let operatorReference = cleanString(input.operatorReference);
  if (operatorReference.length > 255) {
    errors.operatorReference = "Operator reference cannot exceed 255 characters.";
  }
  if (!operatorReference) {
    operatorReference = void 0;
  }
  const amountParsed = parseAndValidateAmount(input.amountClaimedEur);
  if (!amountParsed) {
    errors.amountClaimedEur = "A valid, positive monetary amount in EUR is required (e.g. 1250.50).";
  }
  const rawDetails = typeof input.caseDetails === "string" ? input.caseDetails : "";
  const trimmedDetails = rawDetails.trim();
  if (!trimmedDetails) {
    errors.caseDetails = "Please provide the details of the case.";
  } else if (trimmedDetails.length > 5e4) {
    errors.caseDetails = "Case details cannot exceed 50,000 characters.";
  }
  const informationAccurate = isConsentTrue(input.informationAccurate);
  if (!informationAccurate) {
    errors.informationAccurate = "You must confirm that the information is accurate and true.";
  }
  const personalDataConsent = isConsentTrue(input.personalDataConsent);
  if (!personalDataConsent) {
    errors.personalDataConsent = "You must consent to Resolvo processing your personal data.";
  }
  const rulesAccepted = isConsentTrue(input.rulesAccepted);
  if (!rulesAccepted) {
    errors.rulesAccepted = "You must confirm that you have read and accepted the Resolvo Rules of Procedure.";
  }
  if (Object.keys(errors).length > 0) {
    return {
      valid: false,
      errors
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
      dateOfIncident: normalizedDate,
      operator,
      operatorReference,
      amountClaimedEur: amountParsed.eur,
      amountClaimedCents: amountParsed.cents,
      caseDetails: rawDetails,
      // Preserve original unmodified text
      informationAccurate: true,
      personalDataConsent: true,
      rulesAccepted: true,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}

// lib/clio/client.ts
var ClioApiError = class extends Error {
  statusCode;
  details;
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = "ClioApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
};
function getClioConfig() {
  const baseUrl = (process.env.CLIO_BASE_URL || "https://app.clio.com/api/v4").replace(/\/+$/, "");
  const accessToken = process.env.CLIO_ACCESS_TOKEN || "";
  const refreshToken = process.env.CLIO_REFRESH_TOKEN;
  const clientId = process.env.CLIO_CLIENT_ID;
  const clientSecret = process.env.CLIO_CLIENT_SECRET;
  return {
    baseUrl,
    accessToken,
    refreshToken,
    clientId,
    clientSecret
  };
}
var cachedAccessToken = null;
function getActiveAccessToken() {
  if (cachedAccessToken) return cachedAccessToken;
  return process.env.CLIO_ACCESS_TOKEN || "";
}
function setActiveAccessToken(token) {
  cachedAccessToken = token;
}
async function refreshClioToken() {
  const config2 = getClioConfig();
  if (!config2.refreshToken || !config2.clientId || !config2.clientSecret) {
    return null;
  }
  const oauthDomain = config2.baseUrl.replace(/\/api\/v4\/?$/, "");
  const tokenUrl = `${oauthDomain}/oauth/token`;
  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: config2.clientId,
        client_secret: config2.clientSecret,
        refresh_token: config2.refreshToken
      }).toString()
    });
    if (!response.ok) {
      console.error("[Clio Auth] Token refresh failed with status:", response.status);
      return null;
    }
    const data = await response.json();
    if (data.access_token) {
      setActiveAccessToken(data.access_token);
      console.log("[Clio Auth] Access token successfully refreshed.");
      return data.access_token;
    }
  } catch (err) {
    console.error("[Clio Auth] Exception during token refresh:", err.message);
  }
  return null;
}
async function clioRequest(endpoint, options = {}) {
  const config2 = getClioConfig();
  const token = getActiveAccessToken();
  if (!token) {
    throw new ClioApiError("Clio access token is not configured on the server.", 401);
  }
  const url = endpoint.startsWith("http") ? endpoint : `${config2.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    ...options.headers || {}
  };
  let body = void 0;
  if (options.body !== void 0) {
    if (typeof options.body === "string") {
      body = options.body;
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      body = JSON.stringify(options.body);
    }
  }
  let response;
  try {
    response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body
    });
  } catch (fetchErr) {
    throw new ClioApiError(
      `Network error connecting to Clio API: ${fetchErr.message}`,
      502
    );
  }
  if (response.status === 401 && options.retryOnAuthFailure !== false) {
    const newToken = await refreshClioToken();
    if (newToken) {
      return clioRequest(endpoint, {
        ...options,
        retryOnAuthFailure: false
        // Prevent infinite retry loops
      });
    }
    throw new ClioApiError("Clio authentication failed (401 Unauthorized).", 401);
  }
  if (!response.ok) {
    let errorDetails;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = await response.text();
    }
    if (response.status === 403) {
      throw new ClioApiError("Clio permission denied (403 Forbidden).", 403, errorDetails);
    }
    if (response.status === 404) {
      throw new ClioApiError("Clio resource not found (404 Not Found).", 404, errorDetails);
    }
    if (response.status === 429) {
      throw new ClioApiError("Clio API rate limit exceeded (429). Please retry later.", 429, errorDetails);
    }
    if (response.status >= 500) {
      throw new ClioApiError("Clio Manage service error (5xx).", 502, errorDetails);
    }
    throw new ClioApiError(
      `Clio API request failed with status ${response.status}`,
      response.status,
      errorDetails
    );
  }
  if (response.status === 204) {
    return {};
  }
  return await response.json();
}

// lib/clio/contacts.ts
async function findContactByEmail(email) {
  const encodedEmail = encodeURIComponent(email.trim());
  const endpoint = `/contacts.json?type=Person&query=${encodedEmail}&fields=id,name,first_name,last_name,email_addresses{address}`;
  try {
    const response = await clioRequest(endpoint);
    if (response && response.data && response.data.length > 0) {
      const exactMatch = response.data.find(
        (contact) => contact.email_addresses?.some(
          (e) => e.address.toLowerCase() === email.trim().toLowerCase()
        )
      );
      return exactMatch || response.data[0];
    }
  } catch (err) {
    console.error("[Clio Contacts] Error searching contact by email:", err.message);
    throw err;
  }
  return null;
}
async function createContact(data) {
  const endpoint = `/contacts.json?fields=id,name,first_name,last_name,email_addresses,addresses`;
  const payload = {
    data: {
      type: "Person",
      first_name: data.firstName,
      last_name: data.lastName,
      email_addresses: [
        {
          name: "Work",
          address: data.complainantEmail,
          default_email: true
        }
      ],
      addresses: [
        {
          name: "Home",
          street: data.streetHouseNumber,
          city: data.town,
          postal_code: data.postCode,
          country: data.countryOfResidence,
          primary: true
        }
      ]
    }
  };
  const response = await clioRequest(endpoint, {
    method: "POST",
    body: payload
  });
  return response.data;
}
async function findOrCreateContact(data) {
  const existing = await findContactByEmail(data.complainantEmail);
  if (existing) {
    return { contact: existing, created: false };
  }
  const created = await createContact(data);
  return { contact: created, created: true };
}

// lib/clio/matters.ts
async function createMatter(contactId, data) {
  const endpoint = `/matters.json?fields=id,display_number,description,status,client{id,name}`;
  const todayIsoDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const payload = {
    data: {
      client: {
        id: contactId
      },
      description: `Resolvo Dispute - ${data.firstName} ${data.lastName} | Operator: ${data.operator} | Claim: \u20AC${data.amountClaimedEur.toFixed(2)} | Date: ${data.dateOfIncident}`,
      status: "Open",
      open_date: todayIsoDate,
      client_reference: data.operatorReference || `DISPUTE-${data.operator}`
    }
  };
  const response = await clioRequest(endpoint, {
    method: "POST",
    body: payload
  });
  return response.data;
}

// lib/clio/notes.ts
function formatDisputeNoteDetail(data) {
  const accountRefLine = data.operatorReference ? `\u2022 Operator Reference / Account ID: ${data.operatorReference}` : "\u2022 Operator Reference / Account ID: Not provided";
  return `
=== RESOLVO DISPUTE INTAKE SUBMISSION ===

COMPLAINANT INFORMATION:
\u2022 Name: ${data.firstName} ${data.lastName}
\u2022 Email: ${data.complainantEmail}
\u2022 Street & House Number: ${data.streetHouseNumber}
\u2022 Town / City: ${data.town}
\u2022 Post Code: ${data.postCode}
\u2022 Country of Residence: ${data.countryOfResidence}

DISPUTE METADATA:
\u2022 Date of Incident: ${data.dateOfIncident}
\u2022 Operator: ${data.operator}
${accountRefLine}
\u2022 Amount Claimed (EUR): \u20AC${data.amountClaimedEur.toFixed(2)} (${data.amountClaimedCents} cents)
\u2022 Submission Timestamp: ${data.submittedAt}

CASE DETAILS (UNMODIFIED SUBMISSION):
--------------------------------------------------
${data.caseDetails}
--------------------------------------------------

CONSENT & CONFIRMATION AUDIT TRAIL:
[\u2713] Accuracy Declaration: Confirmed by complainant (${data.submittedAt})
    "Information is accurate and true, and claim has not been submitted to another ADR or Court."
[\u2713] Personal Data Consent: Confirmed by complainant (${data.submittedAt})
    "Consents to Resolvo processing personal data and accessing operator/GCB data under Privacy Policy."
[\u2713] Rules Acceptance: Confirmed by complainant (${data.submittedAt})
    "Confirmed reading, understanding, and accepting Resolvo Rules of Procedure."
`.trim();
}
async function createDisputeNote(matterId, data) {
  const endpoint = `/notes.json?fields=id,subject,detail,date,regarding{id,type}`;
  const todayIsoDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const payload = {
    data: {
      subject: `Dispute Intake Details - ${data.operator} (${data.dateOfIncident})`,
      detail: formatDisputeNoteDetail(data),
      date: todayIsoDate,
      regarding: {
        id: matterId,
        type: "Matter"
      }
    }
  };
  const response = await clioRequest(endpoint, {
    method: "POST",
    body: payload
  });
  return response.data;
}

// lib/clio/documents.ts
async function uploadEvidenceDocument(matterId, file) {
  const endpoint = `/documents.json?fields=id,name,latest_document_version{id,uuid,put_url,put_headers}`;
  const createPayload = {
    data: {
      name: file.filename,
      parent: {
        id: matterId,
        type: "Matter"
      }
    }
  };
  const createRes = await clioRequest(endpoint, {
    method: "POST",
    body: createPayload
  });
  const doc = createRes.data;
  const version = doc.latest_document_version;
  if (!version || !version.uuid || !version.put_url) {
    throw new ClioApiError(
      `Clio document creation succeeded but no upload URL returned for "${file.filename}".`,
      502
    );
  }
  const s3Headers = {
    "Content-Type": file.mimeType || "application/octet-stream"
  };
  if (Array.isArray(version.put_headers)) {
    for (const h of version.put_headers) {
      s3Headers[h.name] = h.value;
    }
  }
  try {
    const s3Response = await fetch(version.put_url, {
      method: "PUT",
      headers: s3Headers,
      body: file.buffer
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
      `S3 storage upload error for "${file.filename}": ${err.message}`,
      502
    );
  }
  const patchEndpoint = `/documents/${doc.id}.json`;
  const patchPayload = {
    data: {
      uuid: version.uuid,
      fully_uploaded: true
    }
  };
  await clioRequest(patchEndpoint, {
    method: "PATCH",
    body: patchPayload
  });
  return doc;
}
async function uploadAllEvidenceFiles(matterId, files) {
  let uploadedCount = 0;
  const errors = [];
  for (const file of files) {
    try {
      await uploadEvidenceDocument(matterId, file);
      uploadedCount++;
    } catch (err) {
      const msg = err.message || "Unknown upload error";
      console.error(`[Clio Documents] Failed to upload "${file.filename}":`, msg);
      errors.push(`${file.filename}: ${msg}`);
    }
  }
  return { uploadedCount, errors };
}

// api/clio/intake.ts
var config = {
  api: {
    bodyParser: false
    // Required for busboy streaming of multipart/form-data
  }
};
function setCorsHeaders(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  const origin = req.headers.origin || "";
  if (allowedOrigin === "*" || origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}
async function handler(req, res) {
  if (setCorsHeaders(req, res)) {
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      success: false,
      error: "Method Not Allowed. Use POST."
    });
    return;
  }
  try {
    let parsed;
    try {
      parsed = await parseRequest(req);
    } catch (parseErr) {
      res.status(400).json({
        success: false,
        error: `Failed to parse request payload: ${parseErr.message}`
      });
      return;
    }
    const validation = validateDisputeInput(parsed.fields);
    if (!validation.valid || !validation.data) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        fields: validation.errors
      });
      return;
    }
    const validatedData = validation.data;
    if (parsed.files && parsed.files.length > 0) {
      const fileValidation = validateEvidenceBatch(parsed.files);
      if (!fileValidation.valid) {
        res.status(400).json({
          success: false,
          error: fileValidation.error || "Invalid evidence file provided."
        });
        return;
      }
    }
    const { contact } = await findOrCreateContact(validatedData);
    const matter = await createMatter(contact.id, validatedData);
    let noteCreated = false;
    try {
      await createDisputeNote(matter.id, validatedData);
      noteCreated = true;
    } catch (noteErr) {
      console.warn("[Clio Notes Warning] Note creation warning:", noteErr.message);
    }
    let uploadedCount = 0;
    if (parsed.files && parsed.files.length > 0) {
      const uploadResult = await uploadAllEvidenceFiles(matter.id, parsed.files);
      uploadedCount = uploadResult.uploadedCount;
    }
    res.status(200).json({
      success: true,
      contact: {
        id: contact.id
      },
      matter: {
        id: matter.id
      },
      noteCreated,
      evidenceUploaded: uploadedCount
    });
  } catch (error) {
    if (error instanceof ClioApiError) {
      console.error(`[Clio API Error] Status ${error.statusCode}:`, error.message, error.details);
      let detailMsg = "";
      if (error.details) {
        if (typeof error.details === "object") {
          const det = error.details;
          detailMsg = det.error?.message || det.message || JSON.stringify(det);
        } else {
          detailMsg = String(error.details);
        }
      }
      if (error.statusCode === 401) {
        res.status(401).json({
          success: false,
          error: `Clio authentication failed (401). ${detailMsg || "Please verify CLIO_ACCESS_TOKEN and CLIO_REFRESH_TOKEN."}`
        });
        return;
      }
      if (error.statusCode === 403) {
        res.status(403).json({
          success: false,
          error: `Clio permission denied (403). ${detailMsg || "Your OAuth application lacks required scopes."}`
        });
        return;
      }
      if (error.statusCode === 404) {
        res.status(404).json({
          success: false,
          error: `Clio resource not found (404). ${detailMsg || ""}`
        });
        return;
      }
      if (error.statusCode === 429) {
        res.status(429).json({
          success: false,
          error: "Clio API rate limit reached. Please retry in a few moments."
        });
        return;
      }
      res.status(502).json({
        success: false,
        error: `Clio API Error (${error.statusCode}): ${detailMsg || error.message}`
      });
      return;
    }
    console.error("[Internal Error]:", error.message);
    res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`
    });
  }
}
export {
  config,
  handler as default
};
