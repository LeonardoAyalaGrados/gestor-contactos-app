export type EntidadAuditada = 'CONTACTO' | 'USUARIO';

export type AccionAuditoria =
  | 'LOGIN'
  | 'CREAR'
  | 'ACTUALIZAR'
  | 'DESACTIVAR'
  | 'REACTIVAR'
  | 'CREAR_USUARIO'
  | 'ACTUALIZAR_USUARIO'
  | 'DESACTIVAR_USUARIO';

export interface Auditoria {
  id: number;
  entidad: EntidadAuditada;
  entidadId: number;
  accion: AccionAuditoria;
  usuarioEjecutor: string;
  detalle: string | null;
  timestamp: string;
}
