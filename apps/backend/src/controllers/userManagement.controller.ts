import { Request, Response } from "express";
import { UserManagementService } from "../services/userManagement.service";
import {
  createUserSchema,
  updateUserSchema,
  userFilterSchema,
  ApiResponse,
} from "@rooster-ai/shared";

const userManagementService = new UserManagementService();

/**
 * Admin-only user creation endpoints
 */
export const createOwnerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const adminUserId = req.user!.id;

    const result = await userManagementService.createOwnerUser(
      validatedData,
      adminUserId
    );

    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        temporaryPassword: result.temporaryPassword,
      },
      message:
        "Owner user created successfully. Welcome email sent with login credentials.",
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create owner user",
    };

    res.status(400).json(response);
  }
};

export const createManagerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const creatorUserId = req.user!.id;

    const result = await userManagementService.createManagerUser(
      validatedData,
      creatorUserId
    );

    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        temporaryPassword: result.temporaryPassword,
      },
      message:
        "Manager user created successfully. Welcome email sent with login credentials.",
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create manager user",
    };

    res.status(400).json(response);
  }
};

export const createStaffUser = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const creatorUserId = req.user!.id;

    const result = await userManagementService.createStaffUser(
      validatedData,
      creatorUserId
    );

    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        temporaryPassword: result.temporaryPassword,
      },
      message:
        "Staff user created successfully. Welcome email sent with login credentials.",
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create staff user",
    };

    res.status(400).json(response);
  }
};

/**
 * User management endpoints
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const filters = userFilterSchema.parse(req.query);
    const requestorUserId = req.user!.id;

    const result = await userManagementService.getAllUsers(
      filters,
      requestorUserId
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
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };

    res.status(400).json(response);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);
    const requestorUserId = req.user!.id;

    const user = await userManagementService.updateUser(
      id,
      validatedData,
      requestorUserId
    );

    const response: ApiResponse = {
      success: true,
      data: user,
      message: "User updated successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };

    res.status(400).json(response);
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestorUserId = req.user!.id;

    const user = await userManagementService.deactivateUser(
      id,
      requestorUserId
    );

    const response: ApiResponse = {
      success: true,
      data: user,
      message: "User deactivated successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to deactivate user",
    };

    res.status(400).json(response);
  }
};

export const getUserHierarchyStats = async (req: Request, res: Response) => {
  try {
    const requestorUserId = req.user!.id;

    const stats =
      await userManagementService.getUserHierarchyStats(requestorUserId);

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
          : "Failed to fetch user hierarchy statistics",
    };

    res.status(500).json(response);
  }
};
