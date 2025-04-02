// src/auth/AppleTokenVerifier.ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const APPLE_JWK_URL = new URL('https://appleid.apple.com/auth/keys');
const jwks = createRemoteJWKSet(APPLE_JWK_URL);

export async function verifyAppleIdToken(idToken: string): Promise<{ uid: string; email: string }> {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: 'https://appleid.apple.com',
  });

  const uid = payload.sub;
  const email = payload.email;

  if (typeof uid !== 'string') {
    throw new Error('Invalid Apple ID token: sub is missing or not a string');
  }

  return {
    uid,
    email: typeof email === 'string' ? email : '',
  };
}
