import { Request, Response } from "express";
import { CompanyService } from "../services/company.service";
import { UserManagementService } from "../services/userManagement.service";
import { TokenManagementService } from "../services/tokenManagement.service";

// Import schemas from the main shared package
import {
  createCompanySchema,
  updateCompanySchema,
  companyFilterSchema,
  createUserSchema,
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyFilterInput,
  CreateUserInput,
  ApiResponse,
} from "@rooster-ai/shared";

const companyService = new CompanyService();
const userManagementService = new UserManagementService();
const tokenManagementService = new TokenManagementService();

/**
 * Company Management Endpoints
 */

export const createCompany = async (req: Request, res: Response) => {
  try {
    const validatedData = createCompanySchema.parse(req.body);
    const adminUserId = req.user!.id;

    const company = await companyService.createCompany(
      validatedData,
      adminUserId
    );

    const response: ApiResponse = {
      success: true,
      data: company,
      message: "Company created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create company",
    };

    res.status(400).json(response);
  }
};

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const filters = companyFilterSchema.parse(req.query);
    const adminUserId = req.user!.id;

    const result = await companyService.getAllCompanies(filters, adminUserId);

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
        error instanceof Error ? error.message : "Failed to fetch companies",
    };

    res.status(400).json(response);
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user!.id;

    const company = await companyService.getCompanyById(id, adminUserId);

    const response: ApiResponse = {
      success: true,
      data: company,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Company not found",
    };

    res.status(404).json(response);
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateCompanySchema.parse(req.body);
    const adminUserId = req.user!.id;

    const company = await companyService.updateCompany(
      id,
      validatedData,
      adminUserId
    );

    const response: ApiResponse = {
      success: true,
      data: company,
      message: "Company updated successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update company",
    };

    res.status(400).json(response);
  }
};

export const suspendCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { suspend = true } = req.body;
    const adminUserId = req.user!.id;

    const company = await companyService.suspendCompany(
      id,
      adminUserId,
      suspend
    );

    const response: ApiResponse = {
      success: true,
      data: company,
      message: `Company ${suspend ? "suspended" : "reactivated"} successfully`,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update company status",
    };

    res.status(400).json(response);
  }
};

export const updateTokenLimit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tokenLimit } = req.body;
    const adminUserId = req.user!.id;

    if (typeof tokenLimit !== "number" || tokenLimit < 0) {
      throw new Error("Token limit must be a positive number");
    }

    const company = await companyService.updateTokenLimit(
      id,
      tokenLimit,
      adminUserId
    );

    const response: ApiResponse = {
      success: true,
      data: company,
      message: "Token limit updated successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update token limit",
    };

    res.status(400).json(response);
  }
};

/**
 * User Management Endpoints
 */

export const createOwnerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const adminUserId = req.user!.id;

    const user = await userManagementService.createOwnerUser(
      validatedData,
      adminUserId
    );

    const response: ApiResponse = {
      success: true,
      data: user,
      message: "Owner user created successfully",
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
    const adminUserId = req.user!.id;

    const user = await userManagementService.createManagerUser(
      validatedData,
      adminUserId
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
    const adminUserId = req.user!.id;

    const user = await userManagementService.createStaffUser(
      validatedData,
      adminUserId
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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const adminUserId = req.user!.id;
    const filters = req.query;

    const result = await userManagementService.getAllUsers(
      filters,
      adminUserId
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

/**
 * Token Management Endpoints
 */

export const getTokenUsageStats = async (req: Request, res: Response) => {
  try {
    const adminUserId = req.user!.id;
    const { month, year } = req.query;

    const stats = await tokenManagementService.getAdminTokenStats(
      adminUserId,
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    );

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
          : "Failed to fetch token usage statistics",
    };

    res.status(400).json(response);
  }
};

export const getCompanyTokenUsage = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const adminUserId = req.user!.id;
    const { month, year } = req.query;

    const usage = await tokenManagementService.getCompanyTokenUsage(
      companyId,
      adminUserId,
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    );

    const response: ApiResponse = {
      success: true,
      data: usage,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch company token usage",
    };

    res.status(400).json(response);
  }
};

/**
 * Dashboard Statistics
 */

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const adminUserId = req.user!.id;

    const stats = await companyService.getCompanyStats(adminUserId);

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
          : "Failed to fetch dashboard statistics",
    };

    res.status(500).json(response);
  }
};
