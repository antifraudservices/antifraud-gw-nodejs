// src/config.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

const dbName = 'antifraudgw'
export const optionMongodb = 'mongodb';
export const optionFirestore = 'firestore';

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',

    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',

    dbProvider: process.env.DB_PROVIDER || 'mongodb',
    mongoUri: process.env.MONGO_URI!,
    mongoDbName: process.env.MONGO_DB_NAME || dbName,
  
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    },
  
    googleClientId: process.env.GOOGLE_CLIENT_ID!,
  };
