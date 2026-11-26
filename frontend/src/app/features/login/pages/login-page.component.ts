import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/api/auth.api';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { readableApiError } from '../../../core/api/api-error';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="login-layout">
      <div class="login-aside">
        <div class="login-aside-content">
          <div class="login-monogram">N</div>
          <p class="eyebrow eyebrow-light">NEXODIR · CONTACTOS</p>
          <h1>Las relaciones de tu negocio, en un solo lugar.</h1>
          <p class="login-aside-copy">Una agenda clara para mantener cerca a clientes, proveedores y a las personas que hacen crecer tu empresa.</p>
          <div class="login-decoration" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        </div>
        <small class="login-aside-footer">Gestión de Contactos</small>
      </div>

      <div class="login-main">
        <div class="login-card">
          <a class="login-brand-mobile" routerLink="/contactos"><span class="brand-mark">N</span><strong>NexoDir</strong></a>
          <p class="eyebrow">BIENVENIDO DE NUEVO</p>
          <h2>Inicia sesión</h2>
          <p class="login-lead">Ingresa tus credenciales para continuar.</p>

          <form (submit)="submit($event)">
            <label class="field-label" for="username">Usuario</label>
            <input class="text-input" id="username" name="username" autocomplete="username" placeholder="Tu nombre de usuario" required (input)="updateUsername($event)" (blur)="touch('username')" [attr.aria-invalid]="showError('username')" />
            @if (showError('username')) { <small class="field-error login-field-error">Ingresa tu nombre de usuario.</small> }

            <div class="password-label-row"><label class="field-label" for="password">Contraseña</label></div>
            <input class="text-input" id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••••" required (input)="updatePassword($event)" (blur)="touch('password')" [attr.aria-invalid]="showError('password')" />
            @if (showError('password')) { <small class="field-error login-field-error">Ingresa tu contraseña.</small> }

            <button class="button button-primary login-submit" type="submit" [disabled]="!valid() || loading()">{{ loading() ? 'Ingresando…' : 'Continuar' }} <span>→</span></button>
          </form>

          @if (error()) {
            <div class="notice notice-error" role="alert">{{ error() }}</div>
          }
          <p class="login-availability">Acceso seguro para el equipo NexoDir.</p>
        </div>
        <p class="login-legal">© 2026 NexoDir. Gestión de Contactos.</p>
      </div>
    </section>
  `,
})
export class LoginPageComponent {
  private readonly api = inject(AuthApi);
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly error = signal('');
  readonly loading = signal(false);
  readonly username = signal('');
  readonly password = signal('');
  readonly touched = signal<Record<string, boolean>>({});

  valid(): boolean { return this.username().trim().length > 0 && this.password().length > 0; }
  updateUsername(event: Event): void { this.username.set((event.target as HTMLInputElement).value); }
  updatePassword(event: Event): void { this.password.set((event.target as HTMLInputElement).value); }
  touch(field: string): void { this.touched.update((state) => ({ ...state, [field]: true })); }
  showError(field: 'username' | 'password'): boolean { return !!this.touched()[field] && !(field === 'username' ? this.username().trim() : this.password()).length; }

  submit(event: SubmitEvent): void {
    event.preventDefault();
    this.touch('username'); this.touch('password');
    if (!this.valid()) return;
    this.loading.set(true);
    this.error.set('');
    this.api.login({ username: this.username().trim(), password: this.password() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => { this.session.acceptLogin(response); this.loading.set(false); void this.router.navigate(['/contactos']); },
        error: (error: unknown) => { this.loading.set(false); this.error.set(readableApiError(error, 'No se pudo iniciar sesión.')); },
      });
  }
}
