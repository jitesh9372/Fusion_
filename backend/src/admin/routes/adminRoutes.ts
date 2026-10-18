import { Router } from 'express';
import * as adminController from '../controllers/adminController';

const router = Router();

// Governance & Analytics
router.get('/analytics', adminController.getAnalytics);

// Worker Verification Management
router.get('/workers', adminController.listAllWorkers);
router.patch('/workers/:id/verify', adminController.verifyWorkerStatus);

// System Bookings Monitoring
router.get('/bookings', adminController.listAllBookings);

export default router;
