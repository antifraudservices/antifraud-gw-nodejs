// Copyright 2025 Antifraud Services Inc. under the Apache License, Version 2.0.

import express from 'express';
import consentRoutes from './routes/consent';

const app = express();
app.use(express.json());
app.use('/api', consentRoutes);

export default app;