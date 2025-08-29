// src/managers/ITenantManager.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import { RecordBase } from "../models/resource-document";

/**
 * Represents the full configuration for a single tenant.
 * This object is cached in memory for fast lookups.
 */
export interface TenantConfig extends RecordBase {
  // `id` is inherited from RecordBase
  // Public-facing identifier, used in URLs. e.g., 'org1'
  alternateName: string;

  // Official, registered name.
  legalName: string;

  // The public identifier (e.g., 'taxID|B12345678').
  identifier: string;

  // The public URL where the DID document can be resolved.
  url: string;

  // Contextual information for database collections.
  sector: string;
  jurisdiction: string;
  /**
   * The authoritative DID Document for the tenant, containing all public keys,
   * service endpoints, and other essential metadata.
   */
  didDocument: {
    '@context': string | string[];
    id: string;
    [key: string]: any;
  };

  additionalType: string; // For URN generation
}

/**
 * The flat, simple parameters required to register a new tenant.
 */
export interface SchemaorgOrganizationParam {
  legalName: string;
  additionalType: string;
  domain: string;
  identifier: string; // e.g., 'taxID|B12345678'
  addressCountry: string;
  email: string;
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

  /**
   * Registers a new tenant in the system.
   * @param params The organization's details.
   * @returns The newly created TenantConfig object.
   */
  set(id: string, params: SchemaorgOrganizationParam): Promise<TenantConfig>;
  // registerNewTenant(params: SchemaorgOrganizationParam): Promise<TenantConfig>;
}

