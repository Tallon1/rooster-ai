import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { ApiResponse } from '@rooster-ai/shared';

const analyticsService = new AnalyticsService();

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const metrics = await analyticsService.getDashboardMetrics(tenantId);

    const response: ApiResponse = {
      success: true,
      data: metrics
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch dashboard metrics'
    };

    res.status(500).json(response);
  }
};

export const getStaffUtilization = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const days = parseInt(req.query.days as string) || 30;

    const utilization = await analyticsService.getStaffUtilization(tenantId, days);

    const response: ApiResponse = {
      success: true,
      data: utilization
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch staff utilization'
    };

    res.status(500).json(response);
  }
};

export const getDepartmentAnalytics = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const analytics = await analyticsService.getDepartmentAnalytics(tenantId);

    const response: ApiResponse = {
      success: true,
      data: analytics
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch department analytics'
    };

    res.status(500).json(response);
  }
};

export const getSchedulingTrends = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const days = parseInt(req.query.days as string) || 30;

    const trends = await analyticsService.getSchedulingTrends(tenantId, days);

    const response: ApiResponse = {
      success: true,
      data: trends
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch scheduling trends'
    };

    res.status(500).json(response);
  }
};

export const getCostAnalysis = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);

    const analysis = await analyticsService.getCostAnalysis(tenantId, startDate, endDate);

    const response: ApiResponse = {
      success: true,
      data: analysis
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch cost analysis'
    };

    res.status(400).json(response);
  }
};
