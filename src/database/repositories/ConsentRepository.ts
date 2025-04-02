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