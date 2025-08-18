// src/security/signature.abstract.ts

/* Copyright (c) Connecting Solution & Applications Ltd. */
/* Apache License 2.0 */

import { CryptographyManagerAbstract } from "./cryptography.abstract";

export abstract class CryptographicSignatureAbstract {
    protected keyManager!: CryptographyManagerAbstract

    /** sign receives and returns bytes */
    abstract sign(dataBytes: Uint8Array): Promise<Uint8Array>;

    /** signAndCompactJWT receives JWT data and returns a compact JWS (JWT) */
    abstract signAndCompactJWT(dataJWT: any): Promise<string>;

    /** verify receives signature bytes and returns true or false */
    abstract verify(dataBytes: Uint8Array): Promise<boolean>;

    /** verifyCompactJWT receives JWT data to verify the signature and returns true or false */
    abstract verifyCompactJWT(compactJWT: any): Promise<boolean>;
}

