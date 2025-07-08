import { Request, Response } from 'express';
import { ApiResponse } from '../types';

export const healthCheck = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Rooster AI Backend is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.0.0'
    }
  };
  
  res.json(response);
};
