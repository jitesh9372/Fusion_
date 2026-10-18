import { Request, Response } from 'express';
import { getUserProfile, createUserProfile } from '../services/authService';
import { ApiResponse, UserProfile } from '../types/auth';

/**
 * GET /api/auth/profile
 * Returns the authenticated user's profile.
 * Requires: requireAuth middleware
 */
export const getProfile = async (
  req: Request,
  res: Response<ApiResponse<UserProfile>>
): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    let profile = await getUserProfile(userId);

    // If profile doesn't exist yet (e.g. first OAuth login), create it
    if (!profile && req.auth?.email) {
      profile = await createUserProfile(userId, req.auth.email);
    }

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found.' });
      return;
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    res.status(500).json({ success: false, error: message });
  }
};

/**
 * POST /api/auth/profile
 * Creates a user profile after signup.
 * Requires: requireAuth middleware
 */
export const createProfile = async (
  req: Request,
  res: Response<ApiResponse<UserProfile>>
): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    const email = req.auth?.email;

    if (!userId || !email) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const { full_name } = req.body as { full_name?: string };

    const existing = await getUserProfile(userId);
    if (existing) {
      res.status(409).json({ success: false, error: 'Profile already exists.' });
      return;
    }

    const profile = await createUserProfile(userId, email, full_name);
    res.status(201).json({ success: true, data: profile, message: 'Profile created.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    res.status(500).json({ success: false, error: message });
  }
};

/**
 * GET /api/auth/health
 * Simple health check — no auth required.
 */
export const healthCheck = (
  _req: Request,
  res: Response<ApiResponse<{ status: string }>>
): void => {
  res.json({ success: true, data: { status: 'FUSION Auth API is running.' } });
};
