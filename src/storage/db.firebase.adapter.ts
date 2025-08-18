/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto';
import { Firestore } from '@google-cloud/firestore';
import { DatabaseAbstract } from './database.abstract';

// --- Helper Functions/Interfaces ---
// In a real project, these might live in their own files.
const toUnixTimestamp = (date: any) => date ? new Date(date).getTime() / 1000 : 0;
export const dbDefaultSection = '_default';
export interface RecordBase {
  _id: string;
  _deleted?: boolean;
  _rev?: string;
  [key: string]: any;
}
// ---

export class DatabaseFirebase extends DatabaseAbstract {
  private firestore: Firestore;

  constructor(firestore: Firestore) {
    super();
    this.firestore = firestore;
  }

  // --- Vault and Section Management ---

  async createNewVault(vaultConfig: any): Promise<boolean> {
    if (!vaultConfig || !vaultConfig.id) return false;
    const vaultRef = this.firestore.collection('vaults').doc(vaultConfig.id);
    await vaultRef.set(vaultConfig);
    return true;
  }

  async vaultExists(vaultId: string): Promise<boolean> {
    const vaultRef = this.firestore.collection('vaults').doc(vaultId);
    return (await vaultRef.get()).exists;
  }

  async createNewSection(vaultId: string, sectionId: string): Promise<boolean> {
    const vaultRef = this.firestore.collection('vaults').doc(vaultId);
    if (!(await vaultRef.get()).exists) return false;

    const sectionsRef = vaultRef.collection('sections').doc(sectionId);
    await sectionsRef.set({ entry: [] }); // Initialize with an empty entry array
    return true;
  }

  async updateSection(vaultId: string, sectionId: string, records?: any[]): Promise<boolean> {
    if (!records || records.length === 0) return false;
    
    if (!(await this.sectionExists(vaultId, sectionId))) {
      if (!(await this.createNewSection(vaultId, sectionId))) {
        return false;
      }
    }

    const sectionRef = this.firestore.collection('vaults').doc(vaultId).collection('sections').doc(sectionId);
    const currentSection = await sectionRef.get();
    const existingEntries = currentSection.data()?.entry || [];
    
    // This logic assumes you are adding new records. A more complex merge might be needed.
    const updatedEntries = existingEntries.concat(records);
    await sectionRef.update({ entry: updatedEntries });
    return true;
  }

  async getAllSections(vaultId: string): Promise<string[]> {
    const sectionsRef = this.firestore.collection('vaults').doc(vaultId).collection('sections');
    const sectionsSnapshot = await sectionsRef.get();
    return sectionsSnapshot.docs.map(doc => doc.id);
  }

  async sectionExists(vaultId: string, sectionId: string): Promise<boolean> {
    const sectionRef = this.firestore.collection('vaults').doc(vaultId).collection('sections').doc(sectionId);
    return (await sectionRef.get()).exists;
  }

  // --- Record (Container) Management ---

  async getContainersInSection(vaultId: string, sectionId: string, excludeRecordTypes?: string[]): Promise<any[]> {
    const sectionRef = this.firestore.collection('vaults').doc(vaultId).collection('sections').doc(sectionId);
    const sectionSnapshot = await sectionRef.get();
    const entries = sectionSnapshot.data()?.entry || [];
    if (!excludeRecordTypes) return entries;
    return entries.filter((entry: any) => !excludeRecordTypes.includes(entry.type));
  }
  
  async getContainersListInSection(vaultId: string, sectionId: string): Promise<string[]> {
      const containers = await this.getContainersInSection(vaultId, sectionId);
      return containers.map(c => c._id).filter(Boolean);
  }

  async get(vaultId: string, recordId: string, sectionId?: string): Promise<RecordBase | undefined> {
    const sectionsToSearch = sectionId ? [sectionId] : await this.getAllSections(vaultId);
    let mostRecentRecord: any = undefined;

    for (const sId of sectionsToSearch) {
      const sectionEntries = await this.getContainersInSection(vaultId, sId);
      const versions = sectionEntries.filter((entry: any) => entry._id === recordId);
      
      if (versions.length > 0) {
        const latestVersion = versions.sort((a: any, b: any) => 
            (b.meta?.lastUpdated ? toUnixTimestamp(b.meta.lastUpdated) : 0) - 
            (a.meta?.lastUpdated ? toUnixTimestamp(a.meta.lastUpdated) : 0)
        )[0];

        if (!mostRecentRecord || (latestVersion.meta?.lastUpdated && toUnixTimestamp(latestVersion.meta.lastUpdated) > toUnixTimestamp(mostRecentRecord.meta?.lastUpdated))) {
            mostRecentRecord = latestVersion;
        }
      }
    }
    return mostRecentRecord;
  }

  async put(vaultId: string, records: RecordBase[], sectionId: string = dbDefaultSection): Promise<boolean> {
    const recordsWithRev = records.map(r => ({ ...r, _rev: randomUUID(), meta: { ...r.meta, lastUpdated: new Date().toISOString() } }));
    return this.updateSection(vaultId, sectionId, recordsWithRev);
  }

  // ... (delete, purge, query, getHistory implementations from your code) ...
  public async delete(vaultId: string, containerId: string, sectionId?: string): Promise<boolean> { throw new Error('Not implemented'); }
  public async purge(vaultId: string): Promise<boolean> { throw new Error('Not implemented'); }
  public async query(vaultId: string, query: any): Promise<any[]> { throw new Error('Not implemented'); }
  public async getHistory(vaultId: string, containerId: string): Promise<any[]> { throw new Error('Not implemented'); }
}
