import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { ApiResponse, AuthenticatedRequest } from '../types/auth';

// Extend Express Request to carry auth info
declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedRequest;
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

/**
 * Verifies the Supabase JWT from the Authorization header.
 * Attaches decoded user info to req.auth for downstream handlers.
 */
export const requireAuth = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Missing or invalid authorization header.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Use the anon client to verify — Supabase validates the JWT signature
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      res.status(401).json({ success: false, error: 'Invalid or expired token.' });
      return;
    }

    req.auth = {
      userId: user.id,
      email: user.email ?? '',
    };

    next();
  } catch {
    res.status(500).json({ success: false, error: 'Authentication check failed.' });
  }
};

/**
 * Placeholder for future role-based access control.
 * Usage: requireRole('admin') — to be implemented when profiles table is active.
 */
export const requireRole = (_role: string) => {
  return (_req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    // TODO: Fetch profile from Supabase, check role, reject if insufficient
    // For now, pass through — roles will be enforced in a later phase
    next();
  };
};
