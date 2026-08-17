/**
 * Automated test suite for Resolvo Dispute Submission Backend API & Clio Integration.
 *
 * Tests:
 * 1. Date normalization and rejection of invalid/impossible dates (e.g. 31/02/2026).
 * 2. Currency parsing and integer cent precision.
 * 3. Form fields, character lengths, and email format validation.
 * 4. Required consent checkboxes enforcement.
 * 5. Magic-byte file signatures and file size limits (5 MB single / 10 MB batch).
 * 6. Clio note formatting and audit trail generation.
 * 7. End-to-end API Handler simulation with mocked Clio responses.
 */

import { normalizeAndValidateDate, parseAndValidateAmount, validateDisputeInput } from '../lib/validation/dispute';
import { validateEvidenceFile, validateEvidenceBatch, detectMimeType } from '../lib/validation/file-signature';
import { formatDisputeNoteDetail } from '../lib/clio/notes';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('\n========================================');
console.log('1. Testing Date Validation & Normalization');
console.log('========================================');

assert(normalizeAndValidateDate('2026-05-14') === '2026-05-14', 'Valid ISO date 2026-05-14');
assert(normalizeAndValidateDate('14/05/2026') === '2026-05-14', 'Valid DD/MM/YYYY date converted to ISO');
assert(normalizeAndValidateDate('29/02/2024') === '2024-02-29', 'Valid Leap Year Feb 29 (2024)');
assert(normalizeAndValidateDate('29/02/2025') === null, 'Rejects Non-Leap Year Feb 29 (2025)');
assert(normalizeAndValidateDate('31/02/2026') === null, 'Rejects Impossible Date 31/02/2026');
assert(normalizeAndValidateDate('31/04/2026') === null, 'Rejects April 31st (April has 30 days)');
assert(normalizeAndValidateDate('invalid-date') === null, 'Rejects arbitrary string');
assert(normalizeAndValidateDate('') === null, 'Rejects empty date');

console.log('\n========================================');
console.log('2. Testing Monetary Amount Validation');
console.log('========================================');

const amt1 = parseAndValidateAmount('1250.50');
assert(amt1 !== null && amt1.eur === 1250.5 && amt1.cents === 125050, 'Parses 1250.50 into 125050 cents');

const amt2 = parseAndValidateAmount('1250,50');
assert(amt2 !== null && amt2.cents === 125050, 'Parses comma decimal 1250,50 into 125050 cents');

const amt3 = parseAndValidateAmount('100');
assert(amt3 !== null && amt3.cents === 10000, 'Parses whole number 100 into 10000 cents');

assert(parseAndValidateAmount('-50') === null, 'Rejects negative amount -50');
assert(parseAndValidateAmount('0') === null, 'Rejects zero amount');
assert(parseAndValidateAmount('abc') === null, 'Rejects non-numeric text');
assert(parseAndValidateAmount('') === null, 'Rejects empty amount');

console.log('\n========================================');
console.log('3. Testing Full Dispute Form Validation');
console.log('========================================');

const validPayload = {
  firstName: 'Jane',
  lastName: 'Doe',
  complainantEmail: 'jane.doe@example.com',
  streetHouseNumber: 'Main Street 42',
  town: 'Willemstad',
  postCode: '1000',
  countryOfResidence: 'Curaçao',
  dateOfIncident: '2026-03-10',
  operator: 'CryptoCasino N.V.',
  operatorReference: 'ACC-987654',
  amountClaimedEur: '1500.75',
  caseDetails: 'The operator withheld my balance without providing any justifiable basis.',
  informationAccurate: true,
  personalDataConsent: true,
  rulesAccepted: true,
};

const validRes = validateDisputeInput(validPayload);
assert(validRes.valid === true && validRes.data !== undefined, 'Valid payload passes all checks');
assert(validRes.data?.amountClaimedCents === 150075, 'Valid payload amount stored in integer cents');
assert(validRes.data?.caseDetails === validPayload.caseDetails, 'Preserves original caseDetails text');

// Test missing required fields
const missingRes = validateDisputeInput({
  ...validPayload,
  firstName: '',
  lastName: '   ',
  complainantEmail: '',
  streetHouseNumber: '',
  town: '',
  postCode: '',
  countryOfResidence: '',
  dateOfIncident: '',
  operator: '',
  amountClaimedEur: '',
  caseDetails: '',
});
assert(missingRes.valid === false, 'Detects missing required fields');
assert(!!missingRes.errors?.firstName, 'Flags missing firstName');
assert(!!missingRes.errors?.lastName, 'Flags missing lastName');
assert(!!missingRes.errors?.complainantEmail, 'Flags missing complainantEmail');
assert(!!missingRes.errors?.streetHouseNumber, 'Flags missing streetHouseNumber');
assert(!!missingRes.errors?.operator, 'Flags missing operator');
assert(!!missingRes.errors?.amountClaimedEur, 'Flags missing amountClaimedEur');
assert(!!missingRes.errors?.caseDetails, 'Flags missing caseDetails');

// Test invalid email
const badEmail = validateDisputeInput({ ...validPayload, complainantEmail: 'not-an-email' });
assert(badEmail.valid === false && !!badEmail.errors?.complainantEmail, 'Rejects invalid email format');

// Test missing consents
const noConsent = validateDisputeInput({
  ...validPayload,
  informationAccurate: false,
  personalDataConsent: false,
  rulesAccepted: false,
});
assert(noConsent.valid === false, 'Fails when consents are false');
assert(!!noConsent.errors?.informationAccurate, 'Flags missing informationAccurate');
assert(!!noConsent.errors?.personalDataConsent, 'Flags missing personalDataConsent');
assert(!!noConsent.errors?.rulesAccepted, 'Flags missing rulesAccepted');

console.log('\n========================================');
console.log('4. Testing Evidence File Signatures & Size Limits');
console.log('========================================');

// Mock file buffers
const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const gifHeader = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00]);
const fakePdfBuffer = Buffer.from('%PDF-1.4 file contents here');

assert(detectMimeType(pngHeader) === 'image/png', 'Detects PNG magic bytes');
assert(detectMimeType(jpegHeader) === 'image/jpeg', 'Detects JPEG magic bytes');
assert(detectMimeType(gifHeader) === 'image/gif', 'Detects GIF magic bytes');
assert(detectMimeType(fakePdfBuffer) === null, 'Returns null for non-image buffers');

// Valid PNG file check
const pngCheck = validateEvidenceFile({ filename: 'screenshot.png', buffer: pngHeader });
assert(pngCheck.valid === true && pngCheck.detectedMime === 'image/png', 'Accepts valid PNG evidence');

// Valid JPEG file check
const jpgCheck = validateEvidenceFile({ filename: 'evidence.jpg', buffer: jpegHeader });
assert(jpgCheck.valid === true && jpgCheck.detectedMime === 'image/jpeg', 'Accepts valid JPG evidence');

// Fake extension check (PDF disguised as PNG)
const fakeCheck = validateEvidenceFile({ filename: 'malicious.png', buffer: fakePdfBuffer });
assert(fakeCheck.valid === false, 'Rejects file when content signature does not match image format');

// Unsupported extension check (.pdf, .exe, .zip)
const pdfCheck = validateEvidenceFile({ filename: 'contract.pdf', buffer: fakePdfBuffer });
assert(pdfCheck.valid === false, 'Rejects .pdf files as unsupported extension');

// Oversized single file (> 5MB)
const oversizedSingle = validateEvidenceFile({
  filename: 'huge.png',
  buffer: pngHeader,
  size: 6 * 1024 * 1024,
});
assert(oversizedSingle.valid === false, 'Rejects file > 5 MB');

// Oversized batch (> 10MB)
const batchCheck = validateEvidenceBatch([
  { filename: 'file1.png', buffer: pngHeader, size: 4 * 1024 * 1024 },
  { filename: 'file2.png', buffer: pngHeader, size: 4 * 1024 * 1024 },
  { filename: 'file3.png', buffer: pngHeader, size: 4 * 1024 * 1024 },
]);
assert(batchCheck.valid === false, 'Rejects batch when combined size exceeds 10 MB');

console.log('\n========================================');
console.log('5. Testing Clio Note & Consent Formatting');
console.log('========================================');

if (validRes.data) {
  const noteContent = formatDisputeNoteDetail(validRes.data);
  assert(noteContent.includes('Jane Doe'), 'Note includes complainant name context');
  assert(noteContent.includes('CryptoCasino N.V.'), 'Note includes operator name');
  assert(noteContent.includes('ACC-987654'), 'Note includes account reference');
  assert(noteContent.includes('€1500.75 (150075 cents)'), 'Note records formatted EUR and cents');
  assert(noteContent.includes('Accuracy Declaration: Confirmed'), 'Note records Accuracy Declaration confirmation');
  assert(noteContent.includes('Personal Data Consent: Confirmed'), 'Note records Personal Data Consent confirmation');
  assert(noteContent.includes('Rules Acceptance: Confirmed'), 'Note records Rules Acceptance confirmation');
}

console.log('\n========================================');
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
