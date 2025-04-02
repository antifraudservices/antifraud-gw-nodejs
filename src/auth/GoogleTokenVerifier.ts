import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client();

export async function verifyGoogleIdToken(idToken: string, clientId: string) {
  const ticket = await client.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();

  return {
    uid: payload?.sub!,
    email: payload?.email || '',
  };
}