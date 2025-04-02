// src/fabric/consentAsset.ts

import { createHash } from 'crypto';

export interface ConsentAsset {
  assetId: string;           // SHA256(sector + ':' + userUUID)
  docHash: string;           // SHA256 of the filled PDF (includes terms, email, etc.)
  otpHash: string;           // SHA256 of the OTP code sent and verified
  recipientUrl: string;      // Service authorized
  termsUrl: string;          // GitHub URL or source of the terms template
  termsVersion: string;      // Version of the terms (e.g., tag or commit SHA)
  verified: boolean;         // Whether OTP was verified
  timestamp: string;         // ISO date-time of the consent
}

export function generateConsentId(sector: string, userUUID: string): string {
  return createHash('sha256')
    .update(`${sector}:${userUUID}`)
    .digest('hex');
}

// Optionally, function to build the asset from values
export function buildConsentAsset(data: {
  sector: string;
  userUUID: string;
  docHash: string;
  otpHash: string;
  recipientUrl: string;
  termsUrl: string;
  termsVersion: string;
  verified: boolean;
  timestamp: string;
}): ConsentAsset {
  return {
    assetId: generateConsentId(data.sector, data.userUUID),
    docHash: data.docHash,
    otpHash: data.otpHash,
    recipientUrl: data.recipientUrl,
    termsUrl: data.termsUrl,
    termsVersion: data.termsVersion,
    verified: data.verified,
    timestamp: data.timestamp,
  };
}
