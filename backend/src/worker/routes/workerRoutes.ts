import { Router } from 'express';
import * as workerController from '../controllers/workerController';

const router = Router();

// Profile & Availability
router.get('/profile', workerController.getProfile);
router.put('/profile', workerController.updateProfile);
router.patch('/availability', workerController.updateAvailability);

// Jobs & Requests
router.get('/requests', workerController.getRequests);
router.get('/jobs', workerController.getJobs);
router.patch('/jobs/:id/accept', workerController.acceptJob);
router.patch('/jobs/:id/decline', workerController.declineJob);
router.patch('/jobs/:id/stage', workerController.updateJobStage);

// Wallet & Financials
router.get('/wallet', workerController.getWallet);
router.post('/wallet/withdraw', workerController.withdraw);

// Reviews & Reputation
router.get('/reviews', workerController.getReviews);

// Cooperative Welfare
router.get('/welfare', workerController.getWelfare);
router.post('/welfare', workerController.createWelfare);

// Training & Courses
router.get('/training', workerController.getTraining);

export default router;
