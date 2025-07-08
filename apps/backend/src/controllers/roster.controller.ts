import { Request, Response } from 'express';
import { RosterService } from '../services/roster.service';
import { createRosterSchema, updateRosterSchema, rosterFilterSchema } from '@rooster-ai/shared';
import { ApiResponse } from '@rooster-ai/shared';

const rosterService = new RosterService();

export const createRoster = async (req: Request, res: Response) => {
  try {
    const validatedData = createRosterSchema.parse(req.body);
    const tenantId = req.user!.tenantId;

    const roster = await rosterService.createRoster(validatedData, tenantId);

    const response: ApiResponse = {
      success: true,
      data: roster,
      message: 'Roster created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create roster'
    };

    res.status(400).json(response);
  }
};

export const getRoster = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const roster = await rosterService.getRosterById(id, tenantId);

    const response: ApiResponse = {
      success: true,
      data: roster
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Roster not found'
    };

    res.status(404).json(response);
  }
};

export const getAllRosters = async (req: Request, res: Response) => {
  try {
    const filters = rosterFilterSchema.parse(req.query);
    const tenantId = req.user!.tenantId;

    const result = await rosterService.getAllRosters(tenantId, filters);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      pagination: result.pagination
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch rosters'
    };

    res.status(400).json(response);
  }
};

export const updateRoster = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateRosterSchema.parse(req.body);
    const tenantId = req.user!.tenantId;

    const roster = await rosterService.updateRoster(id, validatedData, tenantId);

    const response: ApiResponse = {
      success: true,
      data: roster,
      message: 'Roster updated successfully'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update roster'
    };

    res.status(400).json(response);
  }
};

export const deleteRoster = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    await rosterService.deleteRoster(id, tenantId);

    const response: ApiResponse = {
      success: true,
      message: 'Roster deleted successfully'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete roster'
    };

    res.status(400).json(response);
  }
};

export const publishRoster = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const roster = await rosterService.publishRoster(id, tenantId);

    const response: ApiResponse = {
      success: true,
      data: roster,
      message: 'Roster published successfully'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish roster'
    };

    res.status(400).json(response);
  }
};

export const addShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const shift = await rosterService.addShiftToRoster(id, req.body, tenantId);

    const response: ApiResponse = {
      success: true,
      data: shift,
      message: 'Shift added successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add shift'
    };

    res.status(400).json(response);
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    const tenantId = req.user!.tenantId;

    const shift = await rosterService.updateShift(shiftId, req.body, tenantId);

    const response: ApiResponse = {
      success: true,
      data: shift,
      message: 'Shift updated successfully'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update shift'
    };

    res.status(400).json(response);
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    const tenantId = req.user!.tenantId;

    await rosterService.deleteShift(shiftId, tenantId);

    const response: ApiResponse = {
      success: true,
      message: 'Shift deleted successfully'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete shift'
    };

    res.status(400).json(response);
  }
};

export const createFromTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { startDate, endDate } = req.body;
    const tenantId = req.user!.tenantId;

    const roster = await rosterService.createRosterFromTemplate(templateId, startDate, endDate, tenantId);

    const response: ApiResponse = {
      success: true,
      data: roster,
      message: 'Roster created from template successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create roster from template'
    };

    res.status(400).json(response);
  }
};

export const getRosterStats = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const stats = await rosterService.getRosterStats(tenantId);

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch roster statistics'
    };

    res.status(500).json(response);
  }
};
