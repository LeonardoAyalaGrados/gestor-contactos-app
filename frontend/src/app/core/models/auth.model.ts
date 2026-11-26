import { RolUsuario } from './usuario.model';

export interface AuthenticatedUser {
  id: number;
  username: string;
  role: RolUsuario;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: AuthenticatedUser;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface StoredSession {
  accessToken: string;
  expiresAt: string;
  user: AuthenticatedUser;
}
