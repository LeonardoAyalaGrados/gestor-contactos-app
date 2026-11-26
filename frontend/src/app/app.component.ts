import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/contactos" aria-label="NexoDir, inicio">
          <span class="brand-mark">N</span>
          <span class="brand-copy"><strong>NexoDir</strong><small>Gestión de Contactos</small></span>
        </a>

        <div class="nav-label">ESPACIO DE TRABAJO</div>
        <nav class="primary-nav" aria-label="Navegación principal">
          <a routerLink="/contactos" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }">
            <span class="nav-icon">◫</span><span>Contactos</span>
          </a>
          <a routerLink="/usuarios" routerLinkActive="active">
            <span class="nav-icon">♙</span><span>Usuarios</span>
          </a>
        </nav>

        <div class="sidebar-bottom">
          <div class="connection-indicator"><span></span> API de desarrollo</div>
          <a class="profile-link" routerLink="/login">
            <span class="avatar avatar-small">ND</span>
            <span><strong>Acceso</strong><small>Iniciar sesión</small></span>
            <span class="profile-arrow">↗</span>
          </a>
        </div>
      </aside>

      <div class="main-shell">
        <header class="topbar">
          <div class="breadcrumb"><span>NexoDir</span><span class="breadcrumb-divider">/</span><strong>Gestión de contactos</strong></div>
          <div class="topbar-side"><span class="topbar-dot"></span><span>Entorno local</span></div>
        </header>
        <main class="page-content"><router-outlet /></main>
        <footer class="app-footer">NexoDir <span>·</span> Gestión de Contactos</footer>
      </div>
    </div>
  `,
})
export class AppComponent {}
