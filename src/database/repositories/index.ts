import { ConsentRepository } from './ConsentRepository';
import { FirestoreConsentRepository } from './FirestoreConsentRepository';
import { MongoConsentRepository } from './MongoConsentRepository';

export function getConsentRepository(): ConsentRepository {
  const provider = process.env.DB_PROVIDER || 'firestore';
  if (provider === 'mongodb') {
    return new MongoConsentRepository();
  }
  return new FirestoreConsentRepository();
}