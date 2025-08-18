// src/managers/ITenantManager.ts
/**
 * Represents the full configuration for a single tenant.
 * This object is cached in memory for fast lookups.
 */
export interface TenantConfig {
  // Public-facing identifier, used in URLs.
  alternateName: string;

  // Official, registered name.
  legalName: string;

  // The unique, internal identifier used for database collections and documents.
  // e.g., { type: 'ein', value: '12345678' }
  legalIdentifier: {
    type: string;
    value: string;
  };

  // The persistent, universal identifier for the tenant.
  urn: string;

  // Contextual information for constructing database collection names.
  sector: string;
  jurisdiction: string;
  /**
   * The authoritative DID Document for the tenant, containing all public keys,
   * service endpoints, and other essential metadata.
   */
  didDocument: {
    '@context': string | string[];
    id: string;
    verificationMethod?: any[];
    keyAgreement?: any[];
    service?: any[];
    [key: string]: any;
  };
}

/**
 * Defines the contract for the Tenant Manager.
 * This service is responsible for loading and providing tenant configurations,
 * acting as a fast in-memory cache to resolve public identifiers to their
 * internal database context.
 */
export interface ITenantManager {
  /**
   * Loads all tenant configurations from the primary database into the in-memory cache.
   * This should be called on application startup.
   */
  loadTenants(): Promise<void>;

  /**
   * Retrieves a tenant's configuration using their public alternateName.
   * @param alternateName The public ID used in URLs (e.g., 'organization-1').
   * @returns The TenantConfig object, or null if not found.
   */
  getConfigByAlternateName(alternateName: string): TenantConfig | null;
}

