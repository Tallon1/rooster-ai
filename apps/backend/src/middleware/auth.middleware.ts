import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWTPayload, ApiResponse } from "@rooster-ai/shared";

const prisma = new PrismaClient();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        tenantId: string;
        companyName: string;
        permissions: string[];
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: "Access token required",
      };
      res.status(401).json(response);
      return;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user || !user.isActive) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid or expired token",
      };
      res.status(401).json(response);
      return;
    }

    if (user.role.name !== "admin" && !user.tenant.isActive) {
      const response: ApiResponse = {
        success: false,
        error: "Company account is suspended. Please contact support.",
      };
      res.status(403).json(response);
      return;
    }

    // ✅ Fix: Proper type handling for permissions
    let permissions: string[] = [];
    if (user.role.permissions) {
      if (Array.isArray(user.role.permissions)) {
        // Ensure all elements are strings
        permissions = user.role.permissions.filter(
          (perm): perm is string => typeof perm === "string"
        );
      } else if (typeof user.role.permissions === "string") {
        // Handle case where permissions might be a single string
        permissions = [user.role.permissions];
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      tenantId: user.tenantId,
      companyName: user.tenant.name,
      permissions,
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: "Invalid token",
    };
    res.status(403).json(response);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: "Insufficient permissions",
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

// Add this missing function
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      error: "Authentication required",
    };
    res.status(401).json(response);
    return;
  }

  if (req.user.role !== "admin") {
    const response: ApiResponse = {
      success: false,
      error: "Admin access required",
    };
    res.status(403).json(response);
    return;
  }

  next();
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
      };
      res.status(401).json(response);
      return;
    }

    // Admin users have all permissions
    if (req.user.role === "admin" || req.user.permissions.includes("*")) {
      next();
      return;
    }

    // Check specific permission
    if (!req.user.permissions.includes(permission)) {
      const response: ApiResponse = {
        success: false,
        error: `Permission required: ${permission}`,
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};
