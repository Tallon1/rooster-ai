// apps/backend/src/controllers/owner.controller.ts
import { Request, Response } from "express";
import { UserManagementService } from "../services/userManagement.service";
import { CompanyService } from "../services/company.service";
import { createUserSchema, ApiResponse } from "@rooster-ai/shared";

const userManagementService = new UserManagementService();
const companyService = new CompanyService();

export const createManagerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const ownerUserId = req.user!.id;

    // Owner creates Manager for their company
    const user = await userManagementService.createManagerUser(
      validatedData,
      ownerUserId
    );

    const response: ApiResponse = {
      success: true,
      data: user,
      message: "Manager user created successfully",
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
    const ownerUserId = req.user!.id;

    // Owner creates Staff for their company
    const user = await userManagementService.createStaffUser(
      validatedData,
      ownerUserId
    );

    const response: ApiResponse = {
      success: true,
      data: user,
      message: "Staff user created successfully",
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

export const getCompanyUsers = async (req: Request, res: Response) => {
  try {
    const ownerUserId = req.user!.id;
    const companyId = req.user!.tenantId;

    const users = await userManagementService.getCompanyUsers(
      companyId,
      ownerUserId
    );

    const response: ApiResponse = {
      success: true,
      data: users,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch company users",
    };

    res.status(400).json(response);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const ownerUserId = req.user!.id;

    const user = await userManagementService.updateUserRole(
      id,
      role,
      ownerUserId
    );

    const response: ApiResponse = {
      success: true,
      data: user,
      message: "User role updated successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update user role",
    };

    res.status(400).json(response);
  }
};

export const getCompanyOverview = async (req: Request, res: Response) => {
  try {
    const companyId = req.user!.tenantId;
    const ownerUserId = req.user!.id;

    const overview = await companyService.getCompanyOverview(
      companyId,
      ownerUserId
    );

    const response: ApiResponse = {
      success: true,
      data: overview,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch company overview",
    };

    res.status(500).json(response);
  }
};

export const updateCompanySettings = async (req: Request, res: Response) => {
  try {
    const companyId = req.user!.tenantId;
    const ownerUserId = req.user!.id;
    const settings = req.body;

    const company = await companyService.updateCompanySettings(
      companyId,
      settings,
      ownerUserId
    );

    const response: ApiResponse = {
      success: true,
      data: company,
      message: "Company settings updated successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update company settings",
    };

    res.status(400).json(response);
  }
};
