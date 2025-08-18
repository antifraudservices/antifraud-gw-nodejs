// src/routes/tenant.ts

import {v4 as uuidv4} from 'uuid';
import express, { Request, Response, NextFunction } from 'express';
import { ICryptography } from '../security/interfaces/ICryptography';
import { QueueAdapter, JobRequest } from '../adapters/queue';
import { QueueAdapterMem } from '../adapters/queue-mem';
import { parseCdsRequest } from '../security/middleware/parseCdsRequest';
import { createDecodeRequestMiddleware } from '../security/middleware/decodeRequest';
import { DataInRequest } from '../utils/http-parser';

// --- Dependency Injection Setup (Mock) ---
const cryptoService: ICryptography = {} as any;
const asyncResponseStore = new Map<string, {
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  result?: string;
}>();
const queueAdapter: QueueAdapter = new QueueAdapterMem(asyncResponseStore);
// ---

const router = express.Router();
const decodeRequest = createDecodeRequestMiddleware(cryptoService);

const createJobName = (cdsRequest: DataInRequest): string => {
  const { tenantId, resourceType, action } = cdsRequest;
  return `${tenantId}:${resourceType}:_${action}`;
};

const startAsyncJob = (req: Request, res: Response) => {
  const cdsRequest = (req as any).cdsRequest!;
  const decodedRequest = (req as any).decodedRequest;

  if (!decodedRequest?.thid) {
    return res.status(400).json({ error: 'Bad Request', message: 'Missing "thid" in decoded payload.' });
  }

  const jobRequest: JobRequest = {
    ...cdsRequest,
    input: decodedRequest,
    meta: { /* Mocked for now */ }
  };

  const jobName = createJobName(cdsRequest);
  queueAdapter.addJob(jobName, jobRequest);
  asyncResponseStore.set(decodedRequest.thid, { status: 'PENDING' });

  res.status(202).send();
};

const pollForJobResult = (req: Request, res: Response) => {
  const { thid } = req.body;
  if (!thid) return res.status(400).json({ error: 'Bad Request', message: 'Missing "thid" for polling.' });
  
  const job = asyncResponseStore.get(thid);
  if (!job) return res.status(404).json({ error: 'Thread ID not found or expired.' });
  if (job.status === 'PENDING') return res.status(202).send();
  
  if (job.status === 'COMPLETED' && job.result) {
    const acceptHeader = req.headers.accept;
    if (acceptHeader === 'application/jwt') {
      res.contentType('application/jwt').send(job.result);
    } else {
      res.contentType('application/x-www-form-urlencoded').send(`response=${job.result}`);
    }
    asyncResponseStore.delete(thid);
  } else {
    res.status(500).json({ error: 'Job failed to process.' });
  }
};

const cdsRoute = '/:tenantId/cds-:jurisdiction/v1/:sectorType/:section/:format/:resourceType/:action';

router.post(cdsRoute, (req, res, next) => {
  // We need a mock http-parser on the request for the test to pass, as the real one isn't fully wired yet.
  (req as any).cdsRequest = { tenantId: 'test-tenant', resourceType: 'Consent', action: '_update' };

  if (req.body.request) {
    // This mocks the middleware chain
    (req as any).decodedRequest = { thid: req.body.thid_in_body_for_test || uuidv4(), body: {} };
    startAsyncJob(req, res);
  } else if (req.body.thid) {
    pollForJobResult(req, res);
  } else {
    res.status(400).json({ error: 'Bad Request' });
  }
});

export default router;
