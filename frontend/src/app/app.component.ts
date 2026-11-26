import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from './core/auth/auth-session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    @if (isLoginRoute()) {
      <main class="login-standalone"><router-outlet /></main>
    } @else {
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
          @if (session.hasRole('ADMIN')) { <a routerLink="/usuarios" routerLinkActive="active">
            <span class="nav-icon">♙</span><span>Usuarios</span>
          </a> }
        </nav>

        <div class="sidebar-bottom">
          <div class="connection-indicator"><span></span> API de desarrollo</div>
          @if (session.isAuthenticated()) {
            <div class="profile-link"><span class="avatar avatar-small">{{ initials() }}</span><span><strong>{{ session.user()?.username }}</strong><small>{{ session.role() }}</small></span><button class="profile-logout" type="button" (click)="logout()">Salir</button></div>
          } @else {
            <a class="profile-link" routerLink="/login"><span class="avatar avatar-small">ND</span><span><strong>Acceso</strong><small>Iniciar sesión</small></span><span class="profile-arrow">↗</span></a>
          }
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
    }
  `,
})
export class AppComponent {
  readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);
  isLoginRoute(): boolean { return this.router.url.split('?')[0].split('#')[0] === '/login'; }
  initials(): string { return (this.session.user()?.username ?? 'ND').slice(0, 2).toUpperCase(); }
  logout(): void { this.session.logout(); }
}
