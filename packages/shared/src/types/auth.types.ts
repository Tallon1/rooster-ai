// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthToken;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  iat: number;
  exp: number;
}
