import { Routes } from '@angular/router';
import { ContactosPageComponent } from './features/contactos/pages/contactos-page.component';
import { LoginPageComponent } from './features/login/pages/login-page.component';
import { UsuariosPageComponent } from './features/usuarios/pages/usuarios-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'contactos' },
  { path: 'contactos', component: ContactosPageComponent, title: 'Contactos | NexoDir' },
  { path: 'usuarios', component: UsuariosPageComponent, title: 'Usuarios | NexoDir' },
  { path: 'login', component: LoginPageComponent, title: 'Iniciar sesión | NexoDir' },
  { path: '**', redirectTo: 'contactos' },
];
