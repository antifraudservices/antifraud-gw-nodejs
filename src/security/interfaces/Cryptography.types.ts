import { JobRequest } from "../../adapters/queue";

// src/security/interfaces/Cryptography.types.ts
export interface RecipientInfo { tenantId: string; header?: Record<string, any>; }
export interface SignerInfo { tenantId: string; protectedHeader: Record<string, any>; unprotectedHeader?: Record<string, any>; }
export interface EncryptRequest { stream: Uint8Array; recipients: RecipientInfo[]; protectedHeader?: Record<string, any>; unprotectedHeader?: Record<string, any>; aad?: Uint8Array; }
export interface JweObject { protected?: string; unprotected?: Record<string, any>; recipients: Array<{ header?: Record<string, any>; encrypted_key?: string; }>; aad?: string; iv: string; ciphertext: string; tag: string; }
export interface SignRequest { payload: Uint8Array; signers: SignerInfo[]; }
export interface JwsObject { payload: string; signatures: Array<{ protected: string; unprotected?: Record<string, any>; signature: string; }>; }
// src/security/interfaces/Cryptography.types.ts

export interface RecipientInfo {
  tenantId: string;
  header?: Record<string, any>;
}

export interface SignerInfo {
  tenantId: string;
  protectedHeader: Record<string, any>;
  unprotectedHeader?: Record<string, any>;
}

export interface EncryptRequest {
  stream: Uint8Array;
  recipients: RecipientInfo[];
  protectedHeader?: Record<string, any>;
  unprotectedHeader?: Record<string, any>;
  aad?: Uint8Array;// src/adapters/queue.ts
  input: Record<string, any>;
  meta?: {
    jws?: { protected?: Record<string, any>; };
    jwe?: { header?: Record<string, any>; };
    bearer?: { jwt: { header?: Record<string, any>; payload?: Record<string, any>; } }
  };
}
export interface QueueAdapter {
  addJob(jobName: string, request: JobRequest, priority?: number): Promise<void>;
}

export interface JweObject {
  protected?: string;
  unprotected?: Record<string, any>;
  recipients: Array<{
    header?: Record<string, any>;
    encrypted_key?: string;
  }>;
  aad?: string;
  iv: string;
  ciphertext: string;
  tag: string;
}

export interface SignRequest {
  payload: Uint8Array;
  signers: SignerInfo[];
}

export interface JwsObject {
  payload: string;
  signatures: Array<{
    protected: string;
    unprotected?: Record<string, any>;
    signature: string;
  }>;
}
