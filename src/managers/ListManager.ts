// src/managers/ListManager.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import { v4 as uuidv4 } from 'uuid';
import { DatabaseAbstract } from '../storage/database.abstract';
import { normalizeInteroperableClaims } from '../utils/claims';

export interface ListInput {
  vaultId: string; // The patient's vault where this List will be stored
  payload: {
    '@context': 'internal.json';
    '@type': 'List';
    claims: Record<string, any>;
  };
}

export class ListManager {
  private db: DatabaseAbstract;

  constructor(dbAdapter: DatabaseAbstract) {
    this.db = dbAdapter;
  }

  async set(input: ListInput): Promise<any> {
    const listId = uuidv4();

    const normalizedClaims = normalizeInteroperableClaims(
      input.payload
    );

    const listDocument = {
      id: listId,
      vaultId: input.vaultId,
      '@context': input.payload['@context'],
      '@type': input.payload['@type'],
      claims: normalizedClaims,
      entry: [],
    };

    await this.db.put(input.vaultId, [listDocument], 'lists');

    return listDocument;
  }

  async addGroup(listId: string, listVaultId: string, groupReference: Record<string, any>): Promise<any> {
    const lists = await this.db.getContainersInSection(listVaultId, 'lists');
    const list = lists.find(l => l.id === listId) as any;

    if (!list) {
      throw new Error(`List with id ${listId} not found in vault ${listVaultId}.`);
    }

    list.entry.push({
      item: groupReference,
      date: new Date().toISOString(),
    });

    await this.db.put(listVaultId, [list, 'lists']);
    
    return list;
  }
}

