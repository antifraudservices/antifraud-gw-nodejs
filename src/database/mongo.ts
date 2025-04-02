// src/database/mongo.ts
import { MongoClient, Db } from 'mongodb';
import { config, optionMongodb } from '../config';

let dbInstance: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (!dbInstance && config.dbProvider === optionMongodb) {
    if (!config.mongoUri) throw new Error('Missing MONGO_URI in environment');

    const client = new MongoClient(config.mongoUri);
    await client.connect();
    dbInstance = client.db(config.mongoDbName);
  }

  return dbInstance!;
}