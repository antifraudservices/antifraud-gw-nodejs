// src/managers/CustomerManager.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import { DatabaseAbstract } from '../storage/database.abstract';
import { ResourceDocument } from '../models/resource-document';
import { Bundle } from '../models/bundle';
import { ManagerResult } from './EmployeeManager'; // Re-using the interface

const CUSTOMER_PROFILE_SECTION = 'profile';

export class CustomerManager {
  private db: DatabaseAbstract;

  constructor(dbAdapter: DatabaseAbstract) {
    this.db = dbAdapter;
  }

  /**
   * Processes a bundle and returns a format-agnostic result.
   */
  public async processBundle(bundle: Bundle, custodianTenantId: string): Promise<ManagerResult> {
    const result: ManagerResult = {
      successEntries: [],
      errorEntries: [],
    };
    const entries = bundle.data ?? [];

    for (const entry of entries) {
      const { request, resource, meta } = entry;
      const customerId = resource?.id || 'unknown';

      try {
        if (!request || !resource?.id) {
          throw new Error('Bundle entry must have a request object and a resource with an id.');
        }
        if (!meta?.claims) {
          throw new Error(`Entry for resource ${customerId} is missing the required 'meta.claims' object.`);
        }

        const claims = meta.claims;
        const vaultId = resource.id;

        if (request.method === 'PUT' || request.method === 'POST') {
          const doc: ResourceDocument = { id: resource.id, vaultId: vaultId, meta: { lastUpdated: new Date().toISOString(), claims: claims }, resource: resource };

          const vaultExists = await this.db.vaultExists(vaultId);
          if (!vaultExists) {
            await this.db.createNewVault({ id: vaultId, custodian: custodianTenantId });
          }
          await this.db.put(vaultId, [doc], CUSTOMER_PROFILE_SECTION);
          result.successEntries.push({ id: resource.id, status: '201 Created', resource: { id: resource.id, resourceType: resource.resourceType } });
        }

      } catch (error: any) {
        result.errorEntries.push({ id: customerId, status: '400 Bad Request', errorMessage: error.message });
      }
    }
    return result;
  }
}

