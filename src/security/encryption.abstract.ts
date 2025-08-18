// src/security/encryption.abstract.ts

/* Copyright (c) Connecting Solution & Applications Ltd. */
/* Apache License 2.0 */

import { CryptographyManagerAbstract } from "./cryptography.abstract";

export abstract class CryptographicEncryptionAbstract {
    protected keyManager!: CryptographyManagerAbstract

    /** encrypt receives plaintext and returns the ciphertext (stringified data but not a compact JWE) */
    abstract encrypt(plaintext: string, publicRecipientsJWKs: any[]): Promise<string>;

    /** encrypt receives JWT data and returns a compact JWE representation */
    abstract encryptAndCompactJWT(data: any, publicRecipientsJWKs: any[]): Promise<string>;

    /** decrypt receives ciphertext and returns the plaintext (stringified data but not an object) */
    abstract decrypt(plaintext: string, publicRecipientsJWKs: any[]): Promise<string>;

    /** encrypt receives JWT data and returns a compact JWE representation */
    abstract decryptDataJWE(data: any, publicRecipientsJWKs: any[]): Promise<string>;
}