import express from 'express';
import smsProvidersRouter from './smsProviders.js';
import mediaRouter from './media.js';

const router = express.Router();

// SMS Providers management routes
router.use('/sms-providers', smsProvidersRouter);

// Media management routes
router.use('/media', mediaRouter);

export default router;
