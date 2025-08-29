// src/utils/claims.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import { knownDomainsReversed } from "./domains.interface";
import { findCanonicalClaimCase } from '../models/schema-definitions';

/**
 * Normalizes a raw claims object from a client application.
 * 
 * - It takes a claims object that may have un-prefixed keys (e.g., 'email').
 * - It uses the '@context' property (e.g., 'org.schema.Person') to determine the correct prefix.
 * - It performs a case-insensitive lookup to find the canonical casing for each claim.
 * - It preserves existing, fully-qualified interoperable claims (e.g., from 'org.ilo.isco').
 * - It returns a new object with fully-qualified and correctly-cased claim keys.
 * 
 * @param {Record<string, any>} rawClaims - The claims object from the client, including '@context' and '@type'.
 * @returns {Record<string, any>} A new object with fully-qualified and correctly-cased claim keys.
 */
export function normalizeInteroperableClaims(
  rawClaims: Record<string, any>
): Record<string, any> {
  const normalizedClaims: Record<string, any> = {};
  const context = rawClaims['@context'];
  if (!context) {
    throw new Error("Claims object must have an '@context' property.");
  }

  const lowerContext = context.toLowerCase();
  const schemaKey = lowerContext;
  const prefix = `${schemaKey}.`;

  for (const key in rawClaims) {
    // Keep @context and @type as they are
    if (key === '@context' || key === '@type') {
      normalizedClaims[key] = rawClaims[key];
      continue;
    }

    const lowerKey = key.toLowerCase();
    const isInteroperable = knownDomainsReversed.some((domain) =>
      lowerKey.startsWith(`${domain}.`)
    );

    if (isInteroperable) {
      normalizedClaims[key] = rawClaims[key];
    } else {
      const canonicalCase = findCanonicalClaimCase(schemaKey, key);
      if (canonicalCase) {
        const newKey = `${prefix}${canonicalCase}`;
        normalizedClaims[newKey] = rawClaims[key];
      } else {
        // Handle unknown claims if necessary (e.g., log a warning)
      }
    }
  }
  
  return normalizedClaims;
}
