// src/server.ts
// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import express from 'express';
import dotenv from 'dotenv';

// Core Components
import { DatabaseMem } from './storage/database.mem';
import { QueueAdapterMem } from './adapters/queue-mem';
import { Worker } from './worker'; // Import the new Worker
import { ManagerRegistry } from './managers/registry';

// Managers
import { TenantMemManager } from './managers/TenantMemManager';
import { EmployeeManager } from './managers/EmployeeManager';
import { CustomerManager } from './managers/CustomerManager';
import { GroupManager } from './managers/GroupManager';
import { ListManager } from './managers/ListManager';

// API Routers
import { createApiRouter } from './routes/api';
import { createDiscoveryRouter } from './routes/discovery';
dotenv.config();

/**
 * Main function to bootstrap and start the application.
 */
async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.text({ type: 'application/x-www-form-urlencoded' }));

  // --- 1. SINGLETON INSTANCES ---
  const db = DatabaseMem.getInstance();
  await db.createNewVault({ id: 'host' });

  const responseStore = new Map<string, { status: string; result?: string; }>();
  const tenantManager = new TenantMemManager(db);
  await tenantManager.loadTenants();

  const managerRegistry: ManagerRegistry = {
    tenantManager: tenantManager,
    employeeManager: new EmployeeManager(db),
    customerManager: new CustomerManager(db),
    groupManager: new GroupManager(db),
    listManager: new ListManager(db),
  };

  // The new Worker instance is created here.
  const worker = new Worker(managerRegistry);

  // The Queue Adapter now receives the Worker as a dependency.
  const queueAdapter = new QueueAdapterMem(responseStore, worker);

  // --- 2. API ROUTERS ---
  const apiRouter = createApiRouter(queueAdapter, tenantManager, responseStore);
  const discoveryRouter = createDiscoveryRouter(tenantManager);

  app.use('/api/v1', apiRouter);
  app.use('/', discoveryRouter);
  // --- 3. START SERVER ---
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Gateway API running on port ${PORT}`);
    console.log('--- ARCHITECTURE SUCCESSFULLY INITIALIZED ---');
  });

  return app;
}

// Export for tests
export { startServer };
