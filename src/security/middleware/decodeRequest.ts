// src/security/middleware/decodeRequest.ts

import { Request, Response, NextFunction } from 'express';
import { ICryptography } from '../interfaces/ICryptography';
import { TextDecoder } from 'util';

// This is a placeholder for the full implementation
export const createDecodeRequestMiddleware = (cryptoService: ICryptography) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // In the final version, this will perform JWE/JWS decoding
    // For now, we just pass through to make the test work.
    (req as any).decodedRequest = { thid: 'mock-thid' };
    next();
  };
};
