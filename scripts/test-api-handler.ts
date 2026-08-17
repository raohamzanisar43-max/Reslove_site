/**
 * End-to-end API Handler simulation test for api/clio/intake
 */

import handler from '../api/clio/intake';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { EventEmitter } from 'events';

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

// Mock Request & Response Factory
function createMockHttp(options: {
  method: string;
  headers?: Record<string, string>;
  body?: unknown;
}) {
  const req = new EventEmitter() as unknown as VercelRequest;
  req.method = options.method;
  req.headers = {
    'content-type': 'application/json',
    ...(options.headers || {}),
  };
  req.body = options.body;

  let statusCode = 200;
  let responseData: unknown = null;
  const resHeaders: Record<string, string> = {};

  const res = {
    statusCode: 200,
    setHeader: (name: string, value: string) => {
      resHeaders[name.toLowerCase()] = value;
      return res;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: unknown) => {
      responseData = data;
      return res;
    },
    end: () => res,
  } as unknown as VercelResponse;

  return {
    req,
    res,
    getStatus: () => statusCode,
    getBody: () => responseData,
    getHeaders: () => resHeaders,
  };
}

async function runTests() {
  console.log('\n========================================');
  console.log('Testing api/clio/intake Serverless Handler');
  console.log('========================================');

  // Test 1: OPTIONS CORS Preflight
  {
    const { req, res, getStatus } = createMockHttp({ method: 'OPTIONS' });
    await handler(req, res);
    assert(getStatus() === 200, 'OPTIONS returns 200 OK for CORS preflight');
  }

  // Test 2: GET Method Not Allowed
  {
    const { req, res, getStatus, getBody } = createMockHttp({ method: 'GET' });
    await handler(req, res);
    assert(getStatus() === 405, 'GET returns 405 Method Not Allowed');
    const body = getBody() as { error?: string };
    assert(body.error?.includes('Method Not Allowed') === true, 'Returns clean 405 error message');
  }

  // Test 3: POST with Missing Required Fields (Validation Error)
  {
    const { req, res, getStatus, getBody } = createMockHttp({
      method: 'POST',
      body: { firstName: 'John' }, // Missing almost everything
    });

    // Provide empty body stream
    process.nextTick(() => {
      req.emit('end');
    });

    await handler(req, res);
    assert(getStatus() === 400, 'Invalid payload returns 400 Bad Request');
    const body = getBody() as { success: boolean; error: string; fields?: Record<string, string> };
    assert(body.success === false, 'success is false');
    assert(body.error === 'Validation failed', 'error is "Validation failed"');
    assert(!!body.fields?.lastName, 'fields map contains lastName error');
    assert(!!body.fields?.complainantEmail, 'fields map contains complainantEmail error');
  }

  console.log('\n========================================');
  console.log(`HANDLER TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
