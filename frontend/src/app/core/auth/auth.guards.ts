import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthSessionService } from './auth-session.service';

export const authenticatedGuard: CanActivateFn = () => {
  const session = inject(AuthSessionService);
  return session.isAuthenticated() || inject(Router).createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const session = inject(AuthSessionService);
  if (!session.isAuthenticated()) return inject(Router).createUrlTree(['/login']);
  return session.hasRole('ADMIN') || inject(Router).createUrlTree(['/acceso-denegado']);
};

export const guestGuard: CanActivateFn = () => {
  const session = inject(AuthSessionService);
  return session.isAuthenticated() ? inject(Router).createUrlTree(['/contactos']) : true;
};
