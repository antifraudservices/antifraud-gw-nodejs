/* Copyright (c) Connecting Solution & Applications Ltd., Conéctate Soluciones y Aplicaciones SL */
/* Apache License 2.0 */

/**
* DatabaseAbstract implements asynchronous methods for a structured, multi-tenant database.
* The concepts of 'vaults' (tenants) and 'sections' (data partitions) are used to organize data.
*/
export abstract class DatabaseAbstract {
  /** Creates a new vault (e.g., for a new tenant). */
  public abstract createNewVault(vaultConfig?: any): Promise<boolean>;
  
  /** Checks if a vault exists. */
  public abstract vaultExists(vaultId: string): Promise<boolean>;
  
  /** Creates a new section within a vault. */
  abstract createNewSection(vaultId: string, sectionId: string): Promise<boolean>
  
  /** Updates or creates a section with the provided records. */
  public abstract updateSection(vaultId: string, sectionId: string, containers?: any[]): Promise<boolean>;
  
  /** Retrieves all section IDs from a vault. */
  public abstract getAllSections(vaultId: string): Promise<string[]>;
  
  /** Checks if a section exists within a vault. */
  public abstract sectionExists(vaultId: string, sectionId: string): Promise<boolean>;
  
  /** Retrieves a list of record identifiers from a section. */
  public abstract getContainersListInSection(vaultId: string, sectionId: string): Promise<string[]>;
  
  /** Retrieves full records from a section. */
  public abstract getContainersInSection(vaultId: string, sectionId: string, excludeRecordTypes?: string[]): Promise<any[]>;
  
  /** Writes one or more records. */
  public abstract put(vaultId: string, containers: any[], sectionId?: string): Promise<boolean>;
  
  /** Reads a single record by its ID (latest version). */
  public abstract get(vaultId: string, containerId: string, sectionId?: string): Promise<any>;
  
  /** Retrieves all versions of a record by its ID. */
  public abstract getHistory(vaultId: string, containerId: string): Promise<any[]>;
  
  /** Queries for records based on a structured query object. */
  public abstract query(vaultId: string, query: any): Promise<any[]>;
  
  /** Marks a record as deleted. */
  public abstract delete(vaultId: string, containerId: string, sectionId?: string): Promise<boolean>;
  
  /** Permanently removes records marked as deleted. */
  public abstract purge(vaultId: string): Promise<boolean>;
}
