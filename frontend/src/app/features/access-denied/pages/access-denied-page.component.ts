import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<section class="surface-card access-denied"><p class="eyebrow">ACCESO RESTRINGIDO</p><h1>No tienes permisos para esta sección</h1><p>Solicita acceso a un administrador o vuelve a los contactos.</p><a class="button button-primary" routerLink="/contactos">Volver a contactos</a></section>`,
})
export class AccessDeniedPageComponent {}
