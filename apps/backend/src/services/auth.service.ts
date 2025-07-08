import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginInput, RegisterInput, AuthResponse, JWTPayload } from '@rooster-ai/shared';

const prisma = new PrismaClient();

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET!;
  private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
  private readonly jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  async register(data: RegisterInput, tenantId: string): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Get default role for tenant
    const defaultRole = await prisma.role.findFirst({
      where: {
        tenantId,
        name: 'staff'
      }
    });

    if (!defaultRole) {
      throw new Error('Default role not found for tenant');
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        tenantId,
        roleId: defaultRole.id
      },
      include: {
        role: true,
        tenant: true
      }
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        tenantId: user.tenantId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      tokens
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    // Find user with role and tenant
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        role: true,
        tenant: true
      }
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        tenantId: user.tenantId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      tokens
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as JWTPayload;
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { role: true }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private generateTokens(user: any) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
      tokenType: 'Bearer' as const
    };
  }

  private generateAccessToken(user: any): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      tenantId: user.tenantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(this.jwtExpiresIn)
    };

    return jwt.sign(payload, this.jwtSecret);
  }

  private generateRefreshToken(user: any): string {
    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(this.jwtRefreshExpiresIn)
    };

    return jwt.sign(payload, this.jwtRefreshSecret);
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 900; // 15 minutes default
    }
  }
}
