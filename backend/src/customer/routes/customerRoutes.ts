import { Router } from 'express';
import * as customerController from '../controllers/customerController';

const router = Router();

router.get('/services', customerController.listServices);
router.get('/workers', customerController.listWorkers);
router.get('/bookings', customerController.listBookings);
router.post('/bookings', customerController.createBooking);
router.patch('/bookings/:id/stage', customerController.updateStage);
router.get('/payments', customerController.listPayments);

export default router;
