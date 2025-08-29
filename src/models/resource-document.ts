// src/models/resource-document.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

/**
 * Defines the base structure for any record stored in the database.
 * It uses a canonical `id` field as the primary identifier.
 */
export interface RecordBase {
  _deleted?: boolean;
  id: string;
  meta: {
    lastUpdated?: string;
    versionId?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Defines the definitive structure for how resources are stored in the database.
 * This structure cleanly separates the standard, interoperable resource from
 * the internal, normalized claims data.
 */
export interface ResourceDocument extends RecordBase {
  // `id` is now inherited from RecordBase.

  // The tenant or client vault this resource belongs to.
  vaultId: string;

  /**
   * The 'meta' property holds all metadata about the resource.
   */
  meta: {
    /**
     * The normalized, self-describing claims object, including '@context' and '@type'.
     * This is our single source of truth for querying and internal logic.
     */
    claims: Record<string, any>;
    [key: string]: any; // Allow other metadata properties
  };

  /**
   * A placeholder for the original, standard-compliant resource object.
   * For our current use case, this will be empty, as the claims are the source of truth.
   */
  resource: any;
}
