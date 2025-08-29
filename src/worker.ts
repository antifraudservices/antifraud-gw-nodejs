// src/worker.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import { JobRequest } from './adapters/queue';
import { ManagerRegistry } from './managers/registry';
import { ManagerResult } from './managers/EmployeeManager';
import { convertResourceDataToArrayOfDataEntries } from './utils/bundle';
import { Bundle } from './models/bundle';
import { parseJobName } from './utils/naming';

/**
 * The Worker is the heart of the background processing logic.
 * It is a dedicated layer that acts as a Job Router and Response Formatter,
 * completely decoupling the Queue Adapter from the business logic.
 */
export class Worker {
  private managers: ManagerRegistry;

  constructor(managers: ManagerRegistry) {
    this.managers = managers;
  }

  /**
   * The main processing function. It takes a job, analyzes its name, routes it, and formats the response.
   * @param jobName The unique name of the job.
   * @param request The job payload.
   */
  public async process(jobName: string, request: JobRequest): Promise<Bundle> {
    const jobInfo = parseJobName(jobName);
    if (!jobInfo) {
      throw new Error(`Invalid job name format: '${jobName}'`);
    }

    const { resourceType, action } = jobInfo;
    const { input, tenantId } = request;

    try {
      // 1. Normalize input to a canonical bundle
      const canonicalEntries = convertResourceDataToArrayOfDataEntries(input.body, '/', 'http://localhost:3000');
      const canonicalBundle: Bundle = { type: input.body.type || 'batch', data: canonicalEntries };

      // 2. Route to the appropriate manager based on the parsed job name
      let managerResult: ManagerResult;
      if (resourceType === 'Employee' && action === '_batch') {
        managerResult = await this.managers.employeeManager.processBundle(tenantId!, canonicalBundle);
      } else if (resourceType === 'Customer' && (action === '_update' || action === '_batch')) {
        managerResult = await this.managers.customerManager.processBundle(canonicalBundle, tenantId!);
      } else {
        throw new Error(`No manager configured for resourceType '${resourceType}' and action '${action}'`);
      }

      // 3. Format the result into the final, client-facing Bundle
      return createSuccessBundle(managerResult);

    } catch (error) {
      console.error(`[Worker] Job '${jobName}' failed for thid ${input.id}`, error);
      return createErrorBundle((error as Error).message);
    }
  }
}
