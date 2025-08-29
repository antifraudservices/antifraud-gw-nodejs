// src/managers/GroupManager.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import { v4 as uuidv4 } from 'uuid';
import { DatabaseAbstract } from '../storage/database.abstract';
import { normalizeInteroperableClaims } from '../utils/claims';

export interface GroupInput {
  vaultId: string; // The vault where this group definition will be stored
  payload: {
    '@context': 'internal.json';
    '@type': 'Group';
    claims: Record<string, any>;
  };
}

export class GroupManager {
  private db: DatabaseAbstract;

  constructor(dbAdapter: DatabaseAbstract) {
    this.db = dbAdapter;
  }

  async set(input: GroupInput): Promise<any> {
    const groupId = uuidv4();

    const normalizedClaims = normalizeInteroperableClaims(
      input.payload,
    );

    const groupDocument = {
      id: groupId,
      vaultId: input.vaultId,
      '@context': input.payload['@context'],
      '@type': input.payload['@type'],
      claims: normalizedClaims,
      meta: {
        lastUpdated: new Date().toISOString()
      }
    };

    await this.db.put(input.vaultId, [groupDocument], 'groups');

    return groupDocument;
  }
}

