import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../models/api-error.model';

export function readableApiError(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;

  const payload = error.error as ApiErrorResponse | null;
  const validationMessages = payload?.validationErrors
    ? Object.values(payload.validationErrors).filter(Boolean)
    : [];
  const details = [...new Set(validationMessages)].join(' ');

  if (details) return details;
  if (payload?.message) return payload.message;
  if (error.status === 0) return 'No se pudo conectar con el servidor. Revisa que el backend esté iniciado.';
  return fallback;
}
