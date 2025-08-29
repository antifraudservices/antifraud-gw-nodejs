// src/database/repositories/MongoConsentRepository.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import { ConsentRepository, ConsentRecord } from './ConsentRepository';
import { getMongoDb } from '../mongo';
import { config } from '../../config';

export class MongoConsentRepository extends ConsentRepository {
  async saveConsent(consent: ConsentRecord): Promise<void> {
    const db = await getMongoDb();
    const collectionName = `${config.nodeEnv}_consent_${consent.sector}`;
    const collection = db.collection(collectionName);
    await collection.updateOne(
      { uid: consent.uid },
      { $set: consent },
      { upsert: true }
    );
  }
}