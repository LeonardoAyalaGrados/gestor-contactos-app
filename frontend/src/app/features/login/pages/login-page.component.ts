import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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
            <input class="text-input" id="username" name="username" autocomplete="username" placeholder="Tu nombre de usuario o correo" required (input)="updateUsername($event)" (blur)="touch('username')" [attr.aria-invalid]="showError('username')" />
            @if (showError('username')) { <small class="field-error login-field-error">Ingresa tu usuario o correo.</small> }

            <div class="password-label-row"><label class="field-label" for="password">Contraseña</label></div>
            <input class="text-input" id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••••" required (input)="updatePassword($event)" (blur)="touch('password')" [attr.aria-invalid]="showError('password')" />
            @if (showError('password')) { <small class="field-error login-field-error">Ingresa tu contraseña.</small> }

            <button class="button button-primary login-submit" type="submit" [disabled]="!valid()">Continuar <span>→</span></button>
          </form>

          @if (notice()) {
            <div class="notice notice-info" role="status">{{ notice() }}</div>
          }
          <p class="login-availability">La autenticación se conectará en una etapa posterior.</p>
          <a class="login-back-link" routerLink="/contactos">Volver a los contactos</a>
        </div>
        <p class="login-legal">© 2026 NexoDir. Gestión de Contactos.</p>
      </div>
    </section>
  `,
})
export class LoginPageComponent {
  readonly notice = signal('');
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
    this.notice.set('La vista está lista. El inicio de sesión todavía no está conectado al backend.');
  }
}
