// src/database/repositories/FirestoreConsentRepository.ts

import { ConsentRepository, ConsentRecord } from './ConsentRepository';
import { getFirestoreDb } from '../firebase';
import { config } from '../../config';

export class FirestoreConsentRepository extends ConsentRepository {
  async saveConsent(consent: ConsentRecord): Promise<void> {
    const db = getFirestoreDb();
    if (!db) throw new Error('Firestore not initialized');
    const collectionName = `${config.nodeEnv}_consent_${consent.sector}`;
    await db.collection(collectionName).doc(consent.uid).set(consent);
  }
}