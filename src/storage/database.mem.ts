// src/storage/database.mem.ts
import { DatabaseAbstract } from "./database.abstract";

// In a real project, these helpers would be in their own files
const generateRev = (container: any, epoch: number) => `${epoch}-${Math.random()}`;
const convertHttpQueryToObject = (query: string) => ({});

export interface RecordBase {
  _id: string;
  _deleted?: boolean;
  _rev?: string;
  [key: string]: any;
}
export interface VaultsDataMem extends Map<string, RecordBase> { }

export class DatabaseMem extends DatabaseAbstract {
  private static instance: DatabaseMem;
  protected vaultConfigsMap = new Map<string, any>();
  private vaultsMap = new Map<string, VaultsDataMem>();
  
  public static getInstance(): DatabaseMem {
    if (!DatabaseMem.instance) {
      DatabaseMem.instance = new DatabaseMem();
    }
    return DatabaseMem.instance;
  }
  
  async createNewVault(vaultConfig: any): Promise<boolean> {
    if (!vaultConfig || !vaultConfig.id) return false;
    this.vaultConfigsMap.set(vaultConfig.id, vaultConfig);
    this.vaultsMap.set(vaultConfig.id, new Map());
    return true;
  }
  
  async vaultExists(vaultId: string): Promise<boolean> {
    return this.vaultConfigsMap.has(vaultId);
  }

  // NOTE: In-memory sections are simplified and don't strictly separate data.
  // The concept is better realized in the Firestore adapter.
  public async createNewSection(vaultId: string, sectionId: string): Promise<boolean> { return this.vaultExists(vaultId); }
  async updateSection(vaultId: string, sectionId: string, containers?: any[]): Promise<boolean> { return true; }
  public async getAllSections(vaultId: string): Promise<string[]> { return Promise.resolve([]); }
  public async sectionExists(vaultId: string, sectionId: string): Promise<boolean> { return this.vaultExists(vaultId); }

  public getContainersListInSection(vaultId: string, sectionId: string, excludeRecordTypes?: string[]): Promise<string[]> {
      const vault = this.vaultsMap.get(vaultId);
      if(!vault) return Promise.resolve([]);
      const ids: string[] = [];
      vault.forEach(container => ids.push(container._id));
      return Promise.resolve(ids);
  }
  public getContainersInSection(vaultId: string, sectionId: string, excludeRecordTypes?: string[]): Promise<any[]> {
      const vault = this.vaultsMap.get(vaultId);
      if(!vault) return Promise.resolve([]);
      const containers: any[] = [];
      vault.forEach(container => containers.push(container));
      return Promise.resolve(containers);
  }

  public async get(vaultId: string, containerId: string): Promise<RecordBase | undefined> {
    const vaultData = this.vaultsMap.get(vaultId);
    if (!vaultData) return undefined;
    return Array.from(vaultData.values()).find(c => c._id === containerId);
  }

  public async put(vaultId: string, containers: RecordBase[], sectionId: string = '_default'): Promise<boolean> {
    if (!this.vaultConfigsMap.has(vaultId)) return false;
    let vaultData = this.vaultsMap.get(vaultId);
    if (!vaultData) {
      vaultData = new Map<string, RecordBase>();
      this.vaultsMap.set(vaultId, vaultData);
    }
    const currentEpoch = Date.now();
    for (let container of containers) {
      if (!container._id) throw new Error("Container must have an _id");
      container._rev = generateRev(container, currentEpoch);
      // In-memory doesn't use sections, just puts it in the vault
      vaultData.set(container._id, container);
    }
    return true;
  }

  async delete(vaultId: string, containerId: string): Promise<boolean> {
    // ... Simplified logic
    const vaultData = this.vaultsMap.get(vaultId);
    if(!vaultData?.has(containerId)) return false;
    const container = vaultData.get(containerId)!;
    container._deleted = true;
    vaultData.set(containerId, container);
    return true;
  }
  
  // Other methods would be implemented similarly for the in-memory test database
  async purge(vaultId: string): Promise<boolean> { return true; }
  async getHistory(vaultId: string, containerId: string): Promise<RecordBase[]> { return []; }
  async query(vaultId: string, query: any): Promise<RecordBase[]> { return []; }
}
