// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

export interface ConsentRecord {
  userEmail: string;
  uid: string;
  sector: string;
  serviceUrl: string;
  timestamp: number;
}

export abstract class ConsentRepository {
  abstract saveConsent(consent: ConsentRecord): Promise<void>;
}