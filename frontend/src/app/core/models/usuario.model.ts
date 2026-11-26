export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';
export type RolUsuario = 'USER' | 'ADMIN';

export interface Usuario {
  id: number;
  username: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  createdAt: string;
  updatedAt: string;
}
