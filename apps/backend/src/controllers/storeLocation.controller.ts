import { Request, Response } from "express";
import { StoreLocationService } from "../services/storeLocation.service";
import {
  createStoreLocationSchema,
  updateStoreLocationSchema,
  assignStaffToLocationSchema,
  storeLocationFilterSchema,
  ApiResponse,
} from "@rooster-ai/shared";

const storeLocationService = new StoreLocationService();

export const createStoreLocation = async (req: Request, res: Response) => {
  try {
    const validatedData = createStoreLocationSchema.parse(req.body);
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    const location = await storeLocationService.createStoreLocation(
      validatedData,
      tenantId,
      userId
    );

    const response: ApiResponse = {
      success: true,
      data: location,
      message: "Store location created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create store location",
    };

    res.status(400).json(response);
  }
};

export const getStoreLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    const location = await storeLocationService.getStoreLocationById(
      id,
      tenantId,
      userId
    );

    const response: ApiResponse = {
      success: true,
      data: location,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Store location not found",
    };

    res.status(404).json(response);
  }
};

export const getAllStoreLocations = async (req: Request, res: Response) => {
  try {
    const filters = storeLocationFilterSchema.parse(req.query);
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    const result = await storeLocationService.getAllStoreLocations(
      tenantId,
      userId,
      filters
    );

    const response: ApiResponse = {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch store locations",
    };

    res.status(400).json(response);
  }
};

export const updateStoreLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateStoreLocationSchema.parse(req.body);
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    const location = await storeLocationService.updateStoreLocation(
      id,
      validatedData,
      tenantId,
      userId
    );

    const response: ApiResponse = {
      success: true,
      data: location,
      message: "Store location updated successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update store location",
    };

    res.status(400).json(response);
  }
};

export const deleteStoreLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    await storeLocationService.deleteStoreLocation(id, tenantId, userId);

    const response: ApiResponse = {
      success: true,
      message: "Store location deleted successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete store location",
    };

    res.status(400).json(response);
  }
};

export const assignStaffToLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = assignStaffToLocationSchema.parse(req.body);
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    const location = await storeLocationService.assignStaffToLocation(
      id,
      validatedData,
      tenantId,
      userId
    );

    const response: ApiResponse = {
      success: true,
      data: location,
      message: "Staff assigned to location successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to assign staff to location",
    };

    res.status(400).json(response);
  }
};

export const getLocationStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    const staff = await storeLocationService.getLocationStaff(
      id,
      tenantId,
      userId
    );

    const response: ApiResponse = {
      success: true,
      data: staff,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch location staff",
    };

    res.status(400).json(response);
  }
};

export const getLocationStats = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;

    const stats = await storeLocationService.getLocationStats(tenantId, userId);

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch location statistics",
    };

    res.status(500).json(response);
  }
};
