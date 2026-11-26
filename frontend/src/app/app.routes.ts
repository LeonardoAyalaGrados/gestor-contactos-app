import { Routes } from '@angular/router';
import { ContactosPageComponent } from './features/contactos/pages/contactos-page.component';
import { LoginPageComponent } from './features/login/pages/login-page.component';
import { UsuariosPageComponent } from './features/usuarios/pages/usuarios-page.component';
import { authenticatedGuard, adminGuard, guestGuard } from './core/auth/auth.guards';
import { AccessDeniedPageComponent } from './features/access-denied/pages/access-denied-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'contactos' },
  { path: 'contactos', component: ContactosPageComponent, canActivate: [authenticatedGuard], title: 'Contactos | NexoDir' },
  { path: 'usuarios', component: UsuariosPageComponent, canActivate: [adminGuard], title: 'Usuarios | NexoDir' },
  { path: 'acceso-denegado', component: AccessDeniedPageComponent, title: 'Acceso denegado | NexoDir' },
  { path: 'login', component: LoginPageComponent, canActivate: [guestGuard], title: 'Iniciar sesión | NexoDir' },
  { path: '**', redirectTo: 'contactos' },
];
