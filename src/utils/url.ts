// src/adapters/queue-mem.ts

import { QueueAdapter, JobRequest } from './queue';
import { ManagerRegistry, ManagerResult } from '../managers/EmployeeManager'; // Re-using ManagerResult
import { convertResourceDataToArrayOfDataEntries, convertPrimaryDocToBundleFHIR } from '../utils/bundle';
import { Bundle, BundleEntry } from '../models/bundle';
/**
 * Formats the raw result from a manager into a final, client-facing Bundle.
 * This is the "Response Formatting" stage of the architecture.
 * @param managerResult The simple `{ success, error }` object from the manager.
 * @param originalFormat The format requested by the client (e.g., 'fhir+json').
 * @returns A fully formed Bundle.
 */
function formatResponseBundle(managerResult: ManagerResult, originalFormat: string): Bundle {
  const responseEntries: BundleEntry[] = [];

  for (const success of managerResult.successEntries) {
    responseEntries.push({
      resource: success.resource || { id: success.id },
      response: { status: success.status }
    });
  }

  for (const error of managerResult.errorEntries) {
    responseEntries.push({
      resource: { id: error.id, resourceType: 'OperationOutcome' },
      response: {
        status: error.status,
        outcome: { issue: [{ details: { text: error.errorMessage } }] }
      }
    });
  }

  const primaryDoc = {
    type: 'batch-response',
    total: managerResult.successEntries.length,
    data: responseEntries,
  };

  // FUTURE: If originalFormat is fhir+json, use convertPrimaryDocToBundleFHIR
  // For now, we return the canonical bundle.
  return primaryDoc;
}


async function processJob(managers: ManagerRegistry, request: JobRequest): Promise<Bundle> {
  const { input, resourceType, action, tenantId, format } = request;
  const jobName = `${resourceType}-${action}`;

  // 1. Normalize input to a canonical bundle
  const canonicalEntries = convertResourceDataToArrayOfDataEntries(input.body, '/', 'http://localhost:3000');
  const canonicalBundle: Bundle = { type: input.body.type || 'batch', data: canonicalEntries };

  // 2. Route to Manager to get the format-agnostic result
  let managerResult: ManagerResult;
  switch (jobName) {
    case 'Employee-_batch':
      managerResult = await managers.employeeManager.processBundle(tenantId!, canonicalBundle);
      break;
    // Add other cases here
    default:
      throw new Error(`Unknown job name: '${jobName}'`);
  }

  // 3. Format the result into the final, client-facing Bundle
  return formatResponseBundle(managerResult, format || 'json');
}

// ... The rest of QueueAdapterMem, which calls processJob ...
export class QueueAdapterMem implements QueueAdapter {
  // ... constructor, addJob, etc. ...
  private async processQueue(): Promise<void> {
    if (this.queue.length > 0) {
      const job = this.queue.shift();
      if (job) {
        const thid = job.request.input.id; // Assuming DIDComm message ID
        try {
          // The result is now the final, formatted bundle.
          const finalBundle = await processJob(this.managers, job.request);
          this.responseStore.set(thid, { status: 'COMPLETED', result: JSON.stringify(finalBundle) });
  } catch (error) {
          // This secondary catch is for unexpected errors in the processJob function itself
          const errorBundle = { type: 'batch-response', total: 0, data: [/*..error entry..*/] }; // Simplified
          this.responseStore.set(thid, { status: 'FAILED', result: JSON.stringify(errorBundle) });
  }
}
    }
  }
  // ... startWorker ...
}
