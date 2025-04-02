import express from 'express';
import consentRoutes from './routes/consent';

const app = express();
app.use(express.json());
app.use('/api', consentRoutes);

export default app;