import express from 'express';
import dotenv from 'dotenv';
import consentRoutes from './routes/consent';
dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', consentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway API running on port ${PORT}`);
});