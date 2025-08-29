// src/adapters/queue.ts
import { DataInRequest } from '../utils/http-parser';

/**
 * Represents the plaintext of a decoded DIDComm message.
 * This is the core business-level "input" for a job.
 */
export interface DecodedDidcommMessage {
  type: string; // Message Type URI (protocol identifier)
  [key: string]: any;
  
  /**
  * The main content of the message
  */
  body: any
}

/**
 * Represents the entire data package for a single job in the queue.
 * It combines the HTTP request context with the decoded message and its security context.
 */
export interface JobRequest extends DataInRequest {
  /**
  * The decoded DIDComm message which constitutes the primary input for the job.
  */
  input: DecodedDidcommMessage;

  /**
  * Metadata enriched by the security middleware from the cryptographic envelope (JWS/JWE).
  */
  meta?: {
    jws?: { protected?: Record<string, any>; };
    jwe?: { header?: Record<string, any>; };
    bearer?: { jwt: { header?: Record<string, any>; payload?: Record<string, any>; } }
    // Other security context properties can be added here.
  };
}

export interface QueueAdapter {
  addJob(jobName: string, request: JobRequest, priority?: number): Promise<void>;
}