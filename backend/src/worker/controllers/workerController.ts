import { Request, Response } from 'express';
import * as workerService from '../services/workerService';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req as any).user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required.' });
    }
    const profile = await workerService.getWorkerProfile(userId);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req as any).user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required.' });
    }
    const updated = await workerService.updateWorkerProfile(userId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req as any).user?.id;
    const { isAvailable } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required.' });
    }
    const updated = await workerService.updateAvailability(userId, isAvailable);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || '';
    const requests = await workerService.getMatchedJobRequests(category);
    res.json({ success: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const workerId = (req.query.workerId as string) || 'wrk-1';
    const jobs = await workerService.getWorkerJobs(workerId);
    res.json({ success: true, data: jobs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const acceptJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workerId, workerName } = req.body;
    const accepted = await workerService.acceptJob(id, workerId, workerName);
    res.json({ success: true, data: accepted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const declineJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const declined = await workerService.declineJob(id);
    res.json({ success: true, data: declined });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateJobStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const updated = await workerService.updateJobStage(id, stage);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getWallet = async (req: Request, res: Response) => {
  try {
    const workerId = (req.query.workerId as string) || 'wrk-1';
    const wallet = await workerService.getWorkerWallet(workerId);
    res.json({ success: true, data: wallet });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const withdraw = async (req: Request, res: Response) => {
  try {
    const { workerId, amount } = req.body;
    const result = await workerService.requestWithdrawal(workerId, Number(amount));
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const workerId = (req.query.workerId as string) || 'wrk-1';
    const reviews = await workerService.getWorkerReviews(workerId);
    res.json({ success: true, data: reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getWelfare = async (req: Request, res: Response) => {
  try {
    const workerId = req.query.workerId as string;
    const claims = await workerService.getWelfareClaims(workerId);
    res.json({ success: true, data: claims });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createWelfare = async (req: Request, res: Response) => {
  try {
    const claim = await workerService.createWelfareClaim(req.body);
    res.status(201).json({ success: true, data: claim });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getTraining = async (_req: Request, res: Response) => {
  try {
    const courses = await workerService.getTrainingCourses();
    res.json({ success: true, data: courses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
