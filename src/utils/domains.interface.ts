// src/utils/domains.interface.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

/**
 * A list of known, fully-qualified context prefixes in reverse DNS format.
 * This is used by the claim normalization utility to identify claims that
 * are already interoperable and should not be modified.
 * All entries should be in lowercase.
 */
export const knownDomainsReversed: string[] = [
  'org.schema',
  'org.hl7.fhir',
  'org.ilo.isco',
  'net.openid',
  // Add other known standards here
];
