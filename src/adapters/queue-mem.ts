// src/adapters/queue-mem.ts

import { QueueAdapter, JobRequest } from './queue';
import { convertResourceOrBundleToPrimaryDoc, convertFhirErrorBundleToJsonApiError } from '../utils/format-converter';

/**
 * Creates a FHIR Bundle for a SUCCESSFUL operation.
 * Crucially, it wraps the actual resulting resource, not a generic OperationOutcome.
 * @param request The original job request, used for context.
 * @param resultResource The actual resource that resulted from the business logic.
 */
const createSuccessBundle = (request: JobRequest, resultResource: any): object => ({
  resourceType: 'Bundle',
  type: 'batch-response', // Or 'searchset' for search actions
  total: 1,
  entry: [{
    resource: resultResource,
    response: {
      status: '200' // Or '201' for creates
    }
  }]
});

const createErrorBundle = (request: JobRequest, error: Error): object => ({
  resourceType: 'OperationOutcome',
  issue: [{
    severity: 'error',
    code: 'exception',
    diagnostics: error.message || 'An unexpected error occurred.'
  }]
});

/**
 * Simulates the actual work being done. It now returns the actual resource operated on.
 */
async function processChaincode(request: JobRequest): Promise<object> {
  const { thid, type, body } = request.input;
  console.log(`[Worker Processing job for thid: ${thid}...`);

  let resultBundle: object;
  try {
    if (request.resourceType === 'Error') {
      throw new Error('Simulated processing failure.');
    }
    await new Promise(resolve => setTimeout(resolve, 100));

    // --- SIMULATE SUCCESSFUL BUSINESS LOGIC ---
    // The "result" of the operation is the resource from the request's body,
    // potentially augmented with a server-assigned ID and metadata.
    const resultResource = {
      ...body,
      id: body.id || 'server-generated-id-123',
      meta: { versionId: '1', lastUpdated: new Date().toISOString() }
    };

    // Create a success bundle containing the actual resource.
    resultBundle = createSuccessBundle(request, resultResource);
    console.log(`[Worker] Finished job for thid: ${thid}`);

        } catch (error) {
    console.error(`[Worker] Job failed for thid ${thid}`, error);
    resultBundle = createErrorBundle(request, error as Error);
        }

  // --- FORMAT CONVERSION LOGIC (Now acts on the correct success/error bundle) ---
  const requestedFormat = type || '';
  if (requestedFormat.includes('api+json')) {
    console.log(`[Worker] Converting response for ${thid} to JSON:API format.`);

    // Check if the bundle contains an error (OperationOutcome)
    const isError = (resultBundle as any).resourceType === 'OperationOutcome';

    if (isError) {
      return convertFhirErrorBundleToJsonApiError(resultBundle);
    } else {
    return convertResourceOrBundleToPrimaryDoc(
      resultBundle,
      request.format || 'unknown-spec',
        `https://${request.tenantId}`,
        request.fullUrl || ''
    );
    }
  }

  // By default, return the FHIR Bundle.
  return resultBundle;
  }


export class QueueAdapterMem implements QueueAdapter {
  private queue: { name: string; request: JobRequest; priority: number }[] = [];
  private responseStore: Map<string, { status: 'PENDING' | 'COMPLETED' | 'FAILED'; result?: string; }>;

  constructor(responseStore: Map<string, any>) {
    this.responseStore = responseStore;
    this.startWorker();
  }

  async addJob(name: string, request: JobRequest, priority = 10): Promise<void> {
    this.queue.push({ name, request, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length > 0) {
      const job = this.queue.shift();
      if (job) {
        const thid = job.request.input.thid;
        try {
          // The worker now returns the correctly formatted object (FHIR or JSON:API)
          const resultObject = await processChaincode(job.request);
          // We always stringify the final object to store it for polling.
          this.responseStore.set(thid, { status: 'COMPLETED', result: JSON.stringify(resultObject) });
        } catch (error) {
          // This secondary catch is for unexpected errors in the processChaincode function itself
          const errorBundle = createErrorBundle(job.request, error as Error);
          this.responseStore.set(thid, { status: 'COMPLETED', result: JSON.stringify(errorBundle) });
        }
      }
    }
  }

  private startWorker(): void {
    setInterval(() => { this.processQueue(); }, 50);
  }
}

