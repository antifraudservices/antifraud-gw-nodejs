// src/adapters/queue.ts
import { DataInRequest } from '../utils/http-parser';

export interface JobRequest extends Omit<DataInRequest, 'input'> {
  /**
   * The processed, decoded, and validated input for the job. This is the
   * decoded JWS payload object from the original FAPI `request` parameter.
   */
  input: Record<string, any>;

  /**
   * Metadata enriched by the security middleware from all cryptographic layers.
   */
  meta?: {
    jws?: { protected?: Record<string, any>; };
    jwe?: { header?: Record<string, any>; };
    bearer?: { jwt: { header?: Record<string, any>; payload?: Record<string, any>; } }
  };
}
export interface QueueAdapter {
  addJob(jobName: string, request: JobRequest, priority?: number): Promise<void>;
}