// src/security/kms.abstract.ts

/* Copyright (c) Connecting Solution & Applications Ltd. */
/* Apache License 2.0 */

import { CryptographicSignatureAbstract } from "./signature.abstract";
import { CryptographicEncryptionAbstract } from "./encryption.abstract";

/**
 * Abstract class representing the key management system (KMS).
 * Provides methods to manage and utilize cryptographic keys for various entities.
 */
export abstract class KeyManagementSystemAbstract {

    /**
     * Registers an entity's cryptographic managers.
     * @param entityId - The identifier for the entity (e.g., user ID, device ID, tenant ID).
     * @param signatureManager - The signature manager instance (if any) for the entity.
     * @param encryptionManager - The encryption manager instance (if any) for the entity.
     */
    abstract registerEntity(entityId: string, signatureManager?: CryptographicSignatureAbstract, encryptionManager?: CryptographicEncryptionAbstract): void;

    /**
     * Retrieves the public JWK for a given entity.
     * @param entityId - The identifier for the entity.
     * @returns Public JWK of the entity or undefined if not found.
     */
    abstract getPublicJWK(entityId: string): any | undefined;

    /**
     * Retrieves the public Key ID ('kid') for a given entity.
     * @param entityId - The identifier for the entity.
     * @returns Public Key ID of the entity or an empty string if not found.
     */
    abstract getKeyID(entityId: string): string;

    /**
     * Signs data for a given entity.
     * @param entityId - The identifier for the entity.
     * @param dataBytes - The data bytes to be signed.
     * @returns Signed data bytes or undefined if the entity or its signature manager is not found.
     */
    abstract sign(entityId: string, dataBytes: Uint8Array): Promise<Uint8Array | undefined>;

    /**
     * Encrypts plaintext for a given entity.
     * @param entityId - The identifier for the entity.
     * @param plaintext - The plaintext to be encrypted.
     * @param publicRecipientsJWKs - Array of public JWKs for the recipients.
     * @returns Encrypted text or undefined if the entity or its encryption manager is not found.
     */
    abstract encrypt(entityId: string, plaintext: string, publicRecipientsJWKs: any[]): Promise<string | undefined>;

    /**
     * Removes an entity's keys from the management system.
     * @param entityId - The identifier for the entity.
     */
    abstract deregisterEntity(entityId: string): void;
}

/**
 * Singleton pattern implementation for KeyManagementSystem.
 * Ensures a single instance of KeyManagementSystem is used throughout the application.
 * 
 * @example
 * const kmsInstance = KeyManagementSystemSingletonAbstract.getInstance();
 */
export abstract class KeyManagementSystemSingletonAbstract {
    private static instance: KeyManagementSystemAbstract;

    private constructor() { }

    /**
     * Retrieves the single instance of KeyManagementSystem.
     * If it doesn't exist, it's created.
     * 
     * @returns {KeyManagementSystem} The single instance of KeyManagementSystem.
     */
    abstract getInstance(): KeyManagementSystemSingletonAbstract;
}