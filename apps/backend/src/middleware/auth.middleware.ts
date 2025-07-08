import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { JWTPayload, ApiResponse } from '@rooster-ai/shared';

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
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Access token required'
      };
      return res.status(401).json(response);
    }

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { role: true }
    });

    if (!user || !user.isActive) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired token'
      };
      return res.status(401).json(response);
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      tenantId: user.tenantId
    };

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid token'
    };
    res.status(403).json(response);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: 'Insufficient permissions'
      };
      return res.status(403).json(response);
    }

    next();
  };
};
