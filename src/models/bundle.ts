// src/models/bundle.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

/**
 * Represents a single entry within a Bundle. This is a data definition.
 */
export interface BundleEntry {
  resource: Record<string, any>;
  meta?: {
    claims: Record<string, any>;
  };
  request?: {
    method: 'POST' | 'PUT' | 'DELETE' | 'GET';
    url: string;
  };
  response?: {
    status: string;
    [key: string]: any;
  };
}

/**
 * Represents the canonical Bundle structure. This is a data definition.
 */
export interface Bundle {
  type: string;
  total?: number;
  data: BundleEntry[];
}

