import express from 'express';
import smsProvidersRouter from './smsProviders.js';

const router = express.Router();

// SMS Providers management routes
router.use('/sms-providers', smsProvidersRouter);

export default router;
