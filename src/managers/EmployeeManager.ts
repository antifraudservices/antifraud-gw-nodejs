// src/managers/EmployeeManager.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import { DatabaseAbstract } from '../storage/database.abstract';
import { ResourceDocument } from '../models/resource-document';
import { Bundle } from '../models/bundle';

const EMPLOYEE_SECTION = 'employees';

/**
 * The format-agnostic result of a manager's processing operation.
 * The worker is responsible for formatting this into a final response Bundle.
 */
export interface ManagerResult {
  successEntries: { id: string; status: string; resource?: any }[];
  errorEntries: { id: string; status: string; errorMessage: string; }[];
}

export class EmployeeManager {
  private db: DatabaseAbstract;

  constructor(dbAdapter: DatabaseAbstract) {
    this.db = dbAdapter;
  }

  /**
   * Processes a bundle and returns a format-agnostic result.
   * It does NOT build the final response bundle.
   */
  public async processBundle(tenantId: string, bundle: Bundle): Promise<ManagerResult> {
    const result: ManagerResult = {
      successEntries: [],
      errorEntries: [],
    };

    for (const entry of bundle.data) {
      const { request, resource, meta } = entry;
      const employeeId = resource?.id || 'unknown';

      try {
        if (!request || !resource?.id) {
          throw new Error('Bundle entry must have a request object and a resource with an id.');
        }
        if (!meta?.claims) {
          throw new Error(`Entry for resource ${employeeId} is missing the required 'meta.claims' object.`);
        }

        const claims = meta.claims;

        if (request.method === 'PUT' || request.method === 'POST') {
          const doc: ResourceDocument = { id: employeeId, vaultId: tenantId, meta: { lastUpdated: new Date().toISOString(), claims: claims }, resource: resource };
          await this.db.put(tenantId, [doc], EMPLOYEE_SECTION);
          result.successEntries.push({ id: employeeId, status: '201 Created', resource: { id: employeeId, resourceType: 'Practitioner' } });
        } else if (request.method === 'DELETE') {
          await this.db.delete(tenantId, employeeId, EMPLOYEE_SECTION);
          result.successEntries.push({ id: employeeId, status: '200 OK' });
        }
      } catch (error: any) {
        result.errorEntries.push({ id: employeeId, status: '400 Bad Request', errorMessage: error.message });
      }
    }
    return result;
  }
}

