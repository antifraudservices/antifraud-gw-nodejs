// src/security/kms-internal.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import crypto from 'crypto';
import { EncryptedData } from './dek-kek';

let sessionKey: Uint8Array | null = null;
let wrappedKEK: Uint8Array | null = null;

export function initializeKMS(): void {
  const rawKEK = process.env.KEK_SECRET;
  if (!rawKEK) {
    throw new Error('KEK_SECRET is required at boot time');
  }

  const dek = Buffer.from(rawKEK, 'base64');
  sessionKey = crypto.randomBytes(32); // AES-256 key

  const iv = crypto.randomBytes(parseInt(process.env.GCM_IV_BYTES || '16', 10));
  const cipher = crypto.createCipheriv('aes-256-gcm', sessionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(dek), cipher.final()]);
  const authTag = cipher.getAuthTag();

  wrappedKEK = Buffer.concat([iv, authTag, ciphertext]);

  // Sanitize raw env variable
  process.env.KEK_SECRET = '<REDACTED>';
}

function getKEK(): Uint8Array {
  if (!sessionKey || !wrappedKEK) {
    throw new Error('KMS not initialized');
  }

  const iv = wrappedKEK.subarray(0, 16);
  const authTag = wrappedKEK.subarray(16, 32);
  const encrypted = wrappedKEK.subarray(32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', sessionKey, iv);
  decipher.setAuthTag(authTag);
  const dek = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return new Uint8Array(dek);
}

export function encryptWithKEK(data: Uint8Array): EncryptedData {
  const kek = getKEK();
  const iv = crypto.randomBytes(parseInt(process.env.GCM_IV_BYTES || '16', 10));
  const cipher = crypto.createCipheriv('aes-256-gcm', kek, iv);

  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: new Uint8Array(ciphertext),
    iv: new Uint8Array(iv),
    authTag: new Uint8Array(authTag),
  };
}

export function decryptWithKEK(encrypted: EncryptedData): Uint8Array {
  const kek = getKEK();
  const decipher = crypto.createDecipheriv('aes-256-gcm', kek, encrypted.iv);
  decipher.setAuthTag(encrypted.authTag);

  const plaintext = Buffer.concat([
    decipher.update(encrypted.ciphertext),
    decipher.final(),
  ]);

  return new Uint8Array(plaintext);
}
