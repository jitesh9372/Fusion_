import { Router } from 'express';
import { getProfile, createProfile, healthCheck } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Health check — public
router.get('/health', healthCheck);

// Profile endpoints — authenticated
router.get('/profile', requireAuth, getProfile);
router.post('/profile', requireAuth, createProfile);

// Future endpoints (to be added in later phases):
// router.put('/profile', requireAuth, updateProfile);
// router.patch('/profile/role', requireAuth, requireRole('admin'), updateRole);
// router.delete('/account', requireAuth, deleteAccount);

export default router;
