import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticatedUser, LoginResponse, StoredSession } from '../models/auth.model';
import { RolUsuario } from '../models/usuario.model';

const SESSION_KEY = 'nexodir.session';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly router = inject(Router);
  private readonly sessionState = signal<StoredSession | null>(this.restore());
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly role = computed(() => this.user()?.role ?? null);

  constructor() { this.scheduleExpiry(); }

  token(): string | null {
    const session = this.sessionState();
    if (!session) return null;
    if (Date.parse(session.expiresAt) <= Date.now()) {
      this.clear();
      return null;
    }
    return session.accessToken;
  }

  isAuthenticated(): boolean { return this.token() !== null; }
  hasRole(role: RolUsuario): boolean { return this.isAuthenticated() && this.role() === role; }

  acceptLogin(response: LoginResponse): void {
    const session: StoredSession = { accessToken: response.accessToken, expiresAt: response.expiresAt, user: response.user };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.sessionState.set(session);
    this.scheduleExpiry();
  }

  logout(redirect = true): void {
    this.clear();
    if (redirect) void this.router.navigate(['/login']);
  }

  private restore(): StoredSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as StoredSession;
      if (!session.accessToken || !session.user || !['USER', 'ADMIN'].includes(session.user.role) || Date.parse(session.expiresAt) <= Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  private scheduleExpiry(): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    const session = this.sessionState();
    if (!session) return;
    const remaining = Date.parse(session.expiresAt) - Date.now();
    if (remaining <= 0) {
      this.logout();
      return;
    }
    this.expiryTimer = setTimeout(() => this.logout(), Math.min(remaining, 2_147_000_000));
  }

  private clear(): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
    localStorage.removeItem(SESSION_KEY);
    this.sessionState.set(null);
  }
}
