// src/auth/verifyIdToken.ts

import { verifyGoogleIdToken } from './GoogleTokenVerifier';
import { verifyAppleIdToken } from './AppleTokenVerifier';

export type Provider = 'google' | 'apple';

export async function verifyIdToken(
  provider: Provider,
  idToken: string
): Promise<{ uid: string; email: string }> {
  if (process.env.NODE_ENV === 'development') {
    return { uid: 'dev-user-id', email: 'dev@example.com' };
  }

  if (provider === 'google') {
    return verifyGoogleIdToken(idToken, process.env.GOOGLE_CLIENT_ID!);
  } else if (provider === 'apple') {
    return verifyAppleIdToken(idToken);
  }

  throw new Error('Unsupported provider');
}
