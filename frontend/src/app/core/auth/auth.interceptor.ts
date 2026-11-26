import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.generated';
import { AuthSessionService } from './auth-session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);
  const token = session.token();
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);
  const authorizedRequest = token && isApiRequest
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorizedRequest).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse && isApiRequest && error.status === 401 && token) {
      session.logout(false);
      void router.navigate(['/login']);
    } else if (error instanceof HttpErrorResponse && isApiRequest && error.status === 403) {
      void router.navigate(['/acceso-denegado']);
    }
    return throwError(() => error);
  }));
};
