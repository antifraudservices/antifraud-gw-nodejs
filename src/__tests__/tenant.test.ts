// src/__tests__/tenant.test.ts

import request from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import tenantRoutes from '../routes/tenant';
import { ICryptography } from '../security/interfaces/ICryptography';

// --- Mocking Dependencies ---

// We need to mock the entire cryptography service.
// This allows us to control the "decrypted" output during the test.
const mockCryptoService: ICryptography = {
  // Simulate parsing a "JWE" (which for our test is just a string)
  parseJwe: jest.fn((jweString: string) => ({ ciphertext: jweString } as any)),
  
  // Simulate decrypting the JWE to get a "JWS" string
  decrypt: jest.fn(async (jweObject, tenantId) => {
    // For the test, the ciphertext of the JWE is the JWS string itself.
    return new TextEncoder().encode(jweObject.ciphertext);
  }),

  // Simulate parsing the JWS string
  parseJws: jest.fn((jwsString: string) => {
    // A mock JWS object. The signature part isn't important for this test.
    const parts = jwsString.split('.');
    const protectedHeader = parts[0];
    const payload = parts[1];
    return {
      signatures: [{ protected: protectedHeader }],
      payload: payload
    } as any;
  }),

  // The most important mock: verifying the JWS and returning the decoded payload
  verify: jest.fn(async (jwsObject) => {
    // The payload is base64url encoded, so we decode it.
    const decodedPayload = JSON.parse(Buffer.from(jwsObject.payload, 'base64url').toString('utf8'));
    return {
      verified: true,
      payload: new TextEncoder().encode(JSON.stringify(decodedPayload))
    };
  }),
} as any;

// We must inject our mock into the middleware factory.
jest.mock('../security/middleware/decodeRequest', () => ({
  createDecodeRequestMiddleware: () => (req: any, res: any, next: any) => {
    // This is a simplified mock of the real middleware logic.
    const jweString = req.body.request;
    const jwsString = Buffer.from(jweString, 'base64url').toString('utf8');
    const [ , payloadB64] = jwsString.split('.');
    const decodedPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    req.decodedRequest = decodedPayload;
    next();
  }
}));

// --- Test Setup ---

const app = express();
// This is crucial for parsing `application/x-www-form-urlencoded` bodies
app.use(express.urlencoded({ extended: true }));
app.use('/', tenantRoutes);

// --- Test Suite ---

describe('Asynchronous FAPI Flow (/tenant/cds-...)', () => {

  it('should accept a new request, return 202, and provide a result upon polling', async () => {
    const thid = uuidv4();
    const tenantId = 'test-tenant';
    const resourceType = 'Consent';
    const action = '_update';

    // 1. Construct the DIDComm/JWS payload that will be "inside" the JWE
    const jwsPayload = {
      iss: 'test-issuer',
      aud: tenantId, // Audience must match the tenant in the URL
      thid: thid,
      type: '<some>+json', // The data format for the body
      body: { message: 'This is the content of the request' }
    };
    const encodedPayload = Buffer.from(JSON.stringify(jwsPayload)).toString('base64url');
    
    // For alg:'none', the header is simple. The signature part is empty.
    const protectedHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'didcomm-signed+json' })).toString('base64url');
    const jwsString = `${protectedHeader}.${encodedPayload}.`;

    // For our test, the "JWE" is just the JWS string, base64url encoded.
    const jweString = Buffer.from(jwsString).toString('base64url');

    const testUrl = `/${tenantId}/cds-us/v1/healthcare/index/fhir/Consent/_update`;

    // 2. --- Initial Request ---
    // Send the secure request to start the asynchronous job.
    const initialResponse = await request(app)
      .post(testUrl)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      // Pass the thid in the body for our mock router to pick it up
      .send({ request: jweString, thid_in_body_for_test: thid });

    // Expect an "Accepted" response immediately.
    expect(initialResponse.status).toBe(202);

    // 3. --- Polling ---
    // Wait for the simulated worker to process the job.
    await new Promise(resolve => setTimeout(resolve, 200));

    // Poll for the result using the `thid`.
    const pollingResponse = await request(app)
      .post(testUrl)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/x-www-form-urlencoded') // We want the response in a form parameter
      .send({ thid: thid });

    // 4. --- Verification ---
    // Expect a 200 OK with the final result.
    expect(pollingResponse.status).toBe(200);
    expect(pollingResponse.header['content-type']).toMatch(/application\/x-www-form-urlencoded/);

    // The response should be in the `response=` parameter.
    expect(pollingResponse.text).toContain('response=');
    
    const responseParam = pollingResponse.text.split('=')[1];
    const decodedResponse = JSON.parse(decodeURIComponent(responseParam));
    
    // Verify the structure of the FHIR Bundle response.
    expect(decodedResponse.resourceType).toBe('Bundle');
    expect(decodedResponse.type).toBe('batch-response');
    expect(decodedResponse.total).toBe(1);
    expect(decodedResponse.entry[0].response.status).toBe('200');
  });
});

