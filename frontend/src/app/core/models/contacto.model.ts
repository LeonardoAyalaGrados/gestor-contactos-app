export type EstadoContacto = 'ACTIVO' | 'INACTIVO';

export interface Contacto {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  estado: EstadoContacto;
  foto: string;
  telefonos: string[];
  correos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactoPayload {
  dni: string;
  nombres: string;
  apellidos: string;
  telefonos: string[];
  correos: string[];
}
