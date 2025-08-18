// src/managers/TenantManager.ts

import { ITenantManager, TenantConfig } from './ITenantManager';
import { DatabaseAbstract } from '../storage/database.abstract';

/**
 * An in-memory cache implementation of the Tenant Manager.
 */
export class TenantManager implements ITenantManager {
  private dbAdapter: DatabaseAbstract;
  private tenantCacheByAlternateName = new Map<string, TenantConfig>();

  // The manager needs a database adapter to read from the 'host' vault.
  constructor(dbAdapter: DatabaseAbstract) {
    this.dbAdapter = dbAdapter;
  }

  /**
   * Loads all tenant configurations from the 'tenants' section of the 'host' vault
   * into the in-memory cache.
   */
  public async loadTenants(): Promise<void> {
    const hostVaultId = 'host';
    const tenantsSectionId = 'tenants';
    
    console.log('[TenantManager] Loading all tenant configurations into memory...');
    
    // We use the dbAdapter to get all tenant config documents.
    const tenantConfigs = await this.dbAdapter.getContainersInSection(hostVaultId, tenantsSectionId);
    
    this.tenantCacheByAlternateName.clear();
    for (const config of tenantConfigs) {
      // The alternateName is the key for our fast lookup cache.
      this.tenantCacheByAlternateName.set(config.alternateName, config as TenantConfig);
    }
    
    console.log(`[TenantManager] Successfully loaded ${this.tenantCacheByAlternateName.size} tenants.`);
  }

  /**
   * Retrieves a tenant's configuration from the cache.
   */
  public getConfigByAlternateName(alternateName: string): TenantConfig | null {
    return this.tenantCacheByAlternateName.get(alternateName) || null;
  }

  // In a full implementation, you would add a method like this:
  // public async registerNewTenant(params: SchemaorgOrganizationParam): Promise<void> {
  //   // 1. Validate the input params
  //   // 2. Construct the TenantConfig object
  //   // 3. Write the new config to the 'host' vault ('tenants' section)
  //   // 4. Write the primary organization document to the correct partitioned collection
  //   // 5. Update the in-memory cache with the new tenant
  // }
}
