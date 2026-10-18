import { Request, Response } from 'express';
import * as adminService from '../services/adminService';

export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardAnalytics();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const listAllWorkers = async (_req: Request, res: Response) => {
  try {
    const workers = await adminService.getAllWorkers();
    res.json({ success: true, data: workers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const verifyWorkerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await adminService.updateWorkerVerification(id, status);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const listAllBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await adminService.getAllBookings();
    res.json({ success: true, data: bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
