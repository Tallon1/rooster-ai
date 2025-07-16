import { Request, Response } from 'express';
import { StaffService } from '../services/staff.service';
import { createStaffSchema, updateStaffSchema, staffFilterSchema } from '@rooster-ai/shared';
import { ApiResponse } from '@rooster-ai/shared';

const staffService = new StaffService();

export const createStaff = async (req: Request, res: Response) => {
  try {
    const validatedData = createStaffSchema.parse(req.body);
    const companyId = req.user!.companyId;

    const staff = await staffService.createStaff(validatedData, companyId);

    const response: ApiResponse = {
      success: true,
      data: staff,
      message: 'Staff member created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create staff member'
    };

    res.status(400).json(response);
  }
};

export const getStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const staff = await staffService.getStaffById(id, companyId);

    const response: ApiResponse = {
      success: true,
      data: staff
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Staff member not found'
    };

    res.status(404).json(response);
  }
};

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const filters = staffFilterSchema.parse(req.query);
    const companyId = req.user!.companyId;

    const result = await staffService.getAllStaff(companyId, filters);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      pagination: result.pagination
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch staff members'
    };

    res.status(400).json(response);
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateStaffSchema.parse(req.body);
    const companyId = req.user!.companyId;

    const staff = await staffService.updateStaff(id, validatedData, companyId);

    const response: ApiResponse = {
      success: true,
      data: staff,
      message: 'Staff member updated successfully'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update staff member'
    };

    res.status(400).json(response);
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    await staffService.deleteStaff(id, companyId);

    const response: ApiResponse = {
      success: true,
      message: 'Staff member deleted successfully'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete staff member'
    };

    res.status(400).json(response);
  }
};

export const getStaffStats = async (req: Request, res: Response) => {
  try {
    const companyId = req.user!.companyId;

    const stats = await staffService.getStaffStats(companyId);

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch staff statistics'
    };

    res.status(500).json(response);
  }
};

export const updateStaffAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    const companyId = req.user!.companyId;

    const staff = await staffService.updateStaffAvailability(id, availability, companyId);

    const response: ApiResponse = {
      success: true,
      data: staff,
      message: 'Staff availability updated successfully'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update staff availability'
    };

    res.status(400).json(response);
  }
};
