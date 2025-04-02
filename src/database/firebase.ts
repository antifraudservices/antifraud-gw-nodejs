// src/database/firebase.ts

import admin from 'firebase-admin';
import { config, optionFirestore } from '../config';

let dbInstance: FirebaseFirestore.Firestore | null = null;

export function getFirestoreDb() {
  if (!dbInstance && process.env.DB_PROVIDER === optionFirestore) {
    const { projectId, clientEmail, privateKey } = config.firebase;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase credentials in environment variables');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    dbInstance = admin.firestore();
  }
  return dbInstance;
}
