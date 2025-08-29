// src/managers/TenantManager.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import { ITenantManager, TenantConfig, SchemaorgOrganizationParam } from './ITenantManager';
import { DatabaseAbstract } from '../storage/database.abstract';
import { config } from '../config';
import { RecordBase } from '../models/resource-document';

/**
 * An in-memory cache implementation of the Tenant Manager.
 */
export class TenantMemManager implements ITenantManager {

  /**
   * Generates the immutable URN for a tenant based on its configuration.
   * This is a pure function and is used on-demand to avoid redundant storage.
   * @param config The TenantConfig object.
   * @returns The URN string.
   */
  public static getURN(config: TenantConfig): string {
    const [idType, idValue] = config.identifier.split('|');
    const orgName = config.legalName.toUpperCase().replace(/\s/g, '_');
    const orgType = (config as any).additionalType?.toUpperCase().replace(/\s/g, '_') || 'ORGANIZATION';
    const sector = config.sector;
    const jurisdiction = config.jurisdiction.toUpperCase();
    const multibaseDid = `z${Buffer.from(config.id).toString('base64url')}`;

    return `urn:antifraud:${sector}:${jurisdiction}:${orgName}:${orgType}:identifier:${idType.toLowerCase()}:${idValue}:did:multibase:${multibaseDid}`;
  }

  private dbAdapter: DatabaseAbstract;
  private tenantCacheByAlternateName = new Map<string, TenantConfig>();

  constructor(dbAdapter: DatabaseAbstract) {
    this.dbAdapter = dbAdapter;
  }
  /**
   * Loads all tenant configurations from the 'host' vault into memory.
   */
  public async loadTenants(): Promise<void> {
    const hostVaultId = 'host';
    const tenantsSectionId = 'tenants';
    console.log('[TenantManager Loading all tenant configurations into memory...');

    const tenantConfigs = await this.dbAdapter.getContainersInSection(hostVaultId, tenantsSectionId);

    this.tenantCacheByAlternateName.clear();
    for (const config of tenantConfigs) {
      const tenantConfig = config as TenantConfig;
      this.tenantCacheByAlternateName.set(tenantConfig.alternateName, tenantConfig);
    }

    console.log(`[TenantManager] Successfully loaded ${this.tenantCacheByAlternateName.size} tenants.`);
  }
  /**
   * Retrieves a tenant's configuration from the cache.
   */
  public getConfigByAlternateName(alternateName: string): TenantConfig | null {
    return this.tenantCacheByAlternateName.get(alternateName) || null;
  }
  /**
   * Creates a new tenant configuration and its associated vault.
   * @param id The client-provided unique identifier for the tenant.
   * @param params The tenant's configuration details.
   */
  public async set(id: string, params: SchemaorgOrganizationParam): Promise<TenantConfig> {
    const hostVaultId = 'host';
    const tenantsSectionId = 'tenants';
    const alternateName = params.legalName.toLowerCase().replace(/\s/g, '-');
    const domain = params.domain;

    // 1. Construct the full tenant configuration document from the basic input.
    // This is where the manager adds internal configuration, like default service endpoints.
    const newTenantConfig: TenantConfig = {
      id: id,
      alternateName,
      legalName: params.legalName,
      identifier: params.identifier,
      url: `${config.apiBaseUrl}/${alternateName}`,
      sector: 'healthcare', // Assuming default sector
      jurisdiction: params.addressCountry,
      didDocument: {
        '@context': 'https://www.w3.org/ns/did/v1',
        id: `did:web:${domain}:${alternateName}`,
        // FUTURE: This service configuration could come from a template based on the tenant's type.
        service: [
          {
            type: 'default-employee-service',
            id: 'v1_healthcare_employees_jsonapi_Employee_path',
            serviceEndpoint: 'Employee',
            actions: ['_batch'],
          },
          {
            type: 'default-customer-service',
            id: 'v1_healthcare_profiles_jsonapi_Customer_path',
            serviceEndpoint: 'Customer',
            actions: ['_update'],
          }
        ]
      },
      additionalType: params.additionalType,
      meta: {
        lastUpdated: new Date().toISOString()
      }
    };

    // 2. Create the tenant's own vault if it doesn't exist.
    const vaultExists = await this.dbAdapter.vaultExists(alternateName);
    if (!vaultExists) {
    await this.dbAdapter.createNewVault({ id: alternateName });
    }

    // 3. Store the tenant's configuration document in the central 'host' vault.
    await this.dbAdapter.put(hostVaultId, [newTenantConfig], tenantsSectionId);

    // 4. Update the in-memory cache.
    this.tenantCacheByAlternateName.set(newTenantConfig.alternateName, newTenantConfig);

    return newTenantConfig;
  }

  /**
   * Provides a secure gateway to store a document in a specific section of a tenant's vault.
   */
  public async storeItemInSection(tenantId: string, sectionId: string, document: RecordBase): Promise<boolean> {
    if (!this.tenantCacheByAlternateName.has(tenantId)) {
      throw new Error(`Attempted to store item in a non-existent or unloaded tenant: ${tenantId}`);
    }
    return this.dbAdapter.put(tenantId, [document], sectionId);
  }

  /**
   * Provides a secure gateway to retrieve a document from a tenant's vault.
   */
  public async getItemFromSection(tenantId: string, sectionId: string, itemId: string): Promise<RecordBase | undefined> {
    if (!this.tenantCacheByAlternateName.has(tenantId)) {
      throw new Error(`Attempted to get item from a non-existent or unloaded tenant: ${tenantId}`);
    }
    const items = await this.dbAdapter.getContainersInSection(tenantId, sectionId);
    return items.find(item => item.id === itemId);
  }

  /**
   * Provides a secure gateway to retrieve all documents from a tenant's vault section.
   */
  public async getAllItemsFromSection(tenantId: string, sectionId: string): Promise<RecordBase[]> {
    if (!this.tenantCacheByAlternateName.has(tenantId)) {
      throw new Error(`Attempted to get all items from a non-existent or unloaded tenant: ${tenantId}`);
    }
    return this.dbAdapter.getContainersInSection(tenantId, sectionId);
  }
}

