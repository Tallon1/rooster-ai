import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { loginSchema, registerSchema } from "@rooster-ai/shared";
import { ApiResponse } from "@rooster-ai/shared";

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // For now, use a default company - in production, this would come from subdomain/domain
    const companyId =
      (req.headers["x-company-id"] as string) || "default-company";

    // Register user
    const result = await authService.register(validatedData, companyId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: "User registered successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };

    res.status(400).json(response);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Login user
    const result = await authService.login(validatedData);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: "Login successful",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };

    res.status(401).json(response);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const result = await authService.refreshToken(refreshToken);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: "Token refreshed successfully",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Token refresh failed",
    };

    res.status(401).json(response);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // In a production app, you might want to blacklist the token
    const response: ApiResponse = {
      success: true,
      message: "Logout successful",
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: "Logout failed",
    };

    res.status(500).json(response);
  }
};
