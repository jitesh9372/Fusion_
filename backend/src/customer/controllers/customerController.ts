import { Request, Response } from 'express';
import * as customerService from '../services/customerService';

export const listServices = async (_req: Request, res: Response) => {
  try {
    const services = await customerService.getServices();
    res.json({ success: true, data: services });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const listWorkers = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const workers = await customerService.getWorkersByTrade(category);
    res.json({ success: true, data: workers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const listBookings = async (req: Request, res: Response) => {
  try {
    const customerId = (req.query.customerId as string) || (req as any).user?.id;
    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Customer ID is required.' });
    }
    const bookings = await customerService.getCustomerBookings(customerId);
    res.json({ success: true, data: bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const booking = await customerService.createCustomerBooking(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const updated = await customerService.updateBookingStage(id, stage);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const listPayments = async (req: Request, res: Response) => {
  try {
    const customerId = (req.query.customerId as string) || (req as any).user?.id;
    if (!customerId) {
      return res.status(400).json({ success: false, error: 'Customer ID is required.' });
    }
    const payments = await customerService.getCustomerPayments(customerId);
    res.json({ success: true, data: payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
