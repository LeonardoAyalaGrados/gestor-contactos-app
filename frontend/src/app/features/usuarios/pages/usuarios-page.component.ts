import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { readableApiError } from '../../../core/api/api-error';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { UsuariosApi } from '../../../core/api/usuarios.api';
import { PageResponse } from '../../../core/models/page.model';
import { RolUsuario, Usuario } from '../../../core/models/usuario.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

interface UsuarioQuery { buscar: string; estado: 'ACTIVO' | 'INACTIVO'; rol: 'TODOS' | 'USER' | 'ADMIN'; page: number; }
interface UsuarioResult { data: PageResponse<Usuario> | null; error: string; }

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <section class="page-heading">
      <div><p class="eyebrow">ADMINISTRACIÓN</p><h1>Usuarios</h1><p class="page-description">Crea cuentas y administra sus roles de acceso.</p></div>
      <button class="button button-primary" type="button" (click)="newUser()">＋ Crear usuario</button>
    </section>

    @if (notice()) { <div class="notice notice-success" role="status">{{ notice() }}</div> }

    <section class="surface-card">
      <div class="list-toolbar">
        <label class="search-box" for="user-search">
          <span class="search-icon">⌕</span>
          <input id="user-search" type="search" placeholder="Buscar por nombre de usuario..." [value]="term()" (input)="search($event)" />
          @if (term()) { <button class="clear-search" type="button" aria-label="Limpiar búsqueda" (click)="clearSearch()">×</button> }
        </label>
        <div class="toolbar-right">
          <label class="filter-label" for="user-state">Estado</label>
          <select id="user-state" class="select-input" [value]="stateFilter()" (change)="changeState($event)"><option value="ACTIVO">Activos</option><option value="INACTIVO">Inactivos</option></select>
          <label class="filter-label" for="user-role">Rol</label>
          <select id="user-role" class="select-input" [value]="roleFilter()" (change)="changeRole($event)"><option value="TODOS">Todos</option><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select>
          <span class="toolbar-count">{{ result()?.totalElements ?? 0 }} usuarios</span>
        </div>
      </div>

      @if (error()) {
        <div class="notice notice-error" role="alert"><span>{{ error() }}</span><button class="button button-small" type="button" (click)="reload()">Reintentar</button></div>
      } @else if (loading()) {
        <div class="loading-state"><span class="spinner"></span><span>Buscando usuarios…</span></div>
      } @else if (!result()?.content?.length) {
        <app-empty-state icon="♙" title="No encontramos usuarios" [description]="term() ? 'Prueba con otro nombre de usuario.' : 'No hay cuentas para mostrar con este filtro.'" />
      } @else {
        <div class="table-scroll"><table class="data-table">
          <thead><tr><th>USUARIO</th><th>ROL</th><th>ESTADO</th><th>ALTA</th><th></th></tr></thead>
          <tbody>
            @for (usuario of result()!.content; track usuario.id) {
              <tr>
                <td><div class="user-cell"><span class="avatar">{{ initials(usuario.username) }}</span><strong>{{ usuario.username }}</strong></div></td>
                <td><span class="role-pill" [class.role-admin]="usuario.rol === 'ADMIN'">{{ usuario.rol }}</span></td>
                <td><span class="status-pill" [class.status-active]="usuario.estado === 'ACTIVO'">{{ usuario.estado }}</span></td>
                <td class="muted-cell">{{ formatDate(usuario.createdAt) }}</td>
                <td class="user-actions"><button class="button button-small" type="button" (click)="editUser(usuario)">Editar</button>@if (usuario.estado === 'ACTIVO') { <button class="button button-small button-danger-quiet" type="button" (click)="deactivate(usuario)">Desactivar</button> }</td>
              </tr>
            }
          </tbody>
        </table></div>
        <div class="pagination-row"><span>Página {{ result()!.number + 1 }} de {{ result()!.totalPages || 1 }}</span>
          <div class="pagination-actions"><button class="button button-small" [disabled]="result()!.first" (click)="changePage(-1)">Anterior</button><button class="button button-small" [disabled]="result()!.last" (click)="changePage(1)">Siguiente</button></div>
        </div>
      }
    </section>
    @if (formOpen()) {
      <div class="overlay modal-overlay" (click)="closeForm()">
        <section class="contact-modal" role="dialog" aria-modal="true" aria-labelledby="user-form-title" (click)="$event.stopPropagation()">
          <div class="modal-heading"><div><p class="eyebrow">ADMINISTRACIÓN</p><h2 id="user-form-title">{{ editing() ? 'Editar usuario' : 'Crear usuario' }}</h2></div><button class="icon-button close-button" type="button" aria-label="Cerrar" (click)="closeForm()">×</button></div>
          @if (formError()) { <div class="notice notice-error" role="alert">{{ formError() }}</div> }
          <form (submit)="save($event)">
            <label class="form-field"><span>Nombre de usuario <b>*</b></span><input class="text-input" name="username" required maxlength="100" [value]="username()" (input)="updateUsername($event)" /></label>
            <label class="form-field"><span>Contraseña {{ editing() ? '(opcional al editar)' : '*' }}</span><input class="text-input" name="password" type="password" [required]="!editing()" [value]="password()" (input)="updatePassword($event)" autocomplete="new-password" /></label>
            <label class="form-field"><span>Rol <b>*</b></span><select class="select-input" name="rol" [value]="role()" [disabled]="isEditingSelf()" (change)="changeUserRole($event)"><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select>@if (isEditingSelf()) { <small class="form-field-hint">No puedes cambiar el rol de tu propia cuenta.</small> }</label>
            <div class="modal-actions"><button class="button button-quiet" type="button" [disabled]="saving()" (click)="closeForm()">Cancelar</button><button class="button button-primary" type="submit" [disabled]="saving() || !username().trim() || (!editing() && !password())">{{ saving() ? 'Guardando…' : editing() ? 'Guardar cambios' : 'Crear usuario' }}</button></div>
          </form>
        </section>
      </div>
    }
  `,
})
export class UsuariosPageComponent {
  private readonly api = inject(UsuariosApi);
  private readonly session = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryChanges = new Subject<UsuarioQuery>();

  readonly term = signal('');
  readonly stateFilter = signal<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  readonly roleFilter = signal<'TODOS' | 'USER' | 'ADMIN'>('TODOS');
  readonly pageNumber = signal(0);
  readonly result = signal<PageResponse<Usuario> | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly formOpen = signal(false);
  readonly editing = signal<Usuario | null>(null);
  readonly username = signal('');
  readonly password = signal('');
  readonly role = signal<RolUsuario>('USER');
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly notice = signal('');

  constructor() {
    this.queryChanges.pipe(
      startWith({ buscar: '', estado: 'ACTIVO' as const, rol: 'TODOS' as const, page: 0 }),
      debounceTime(300),
      tap(() => { this.loading.set(true); this.error.set(''); }),
      switchMap((query) => this.api.listar({ buscar: query.buscar, estado: query.estado, rol: query.rol === 'TODOS' ? undefined : query.rol, page: query.page, size: 20 }).pipe(
        map((data): UsuarioResult => ({ data, error: '' })),
        catchError((err: unknown) => of({ data: null, error: readableApiError(err, 'No se pudieron cargar los usuarios.') })),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      this.loading.set(false);
      if (response.data) this.result.set(response.data);
      else this.error.set(response.error);
    });
  }

  search(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.term.set(value);
    this.pageNumber.set(0);
    this.queryChanges.next(this.query(value, 0));
  }

  clearSearch(): void { this.term.set(''); this.pageNumber.set(0); this.queryChanges.next(this.query('', 0)); }
  changeState(event: Event): void { this.stateFilter.set((event.target as HTMLSelectElement).value as 'ACTIVO' | 'INACTIVO'); this.pageNumber.set(0); this.reload(); }
  changeRole(event: Event): void { this.roleFilter.set((event.target as HTMLSelectElement).value as 'TODOS' | 'USER' | 'ADMIN'); this.pageNumber.set(0); this.reload(); }
  reload(): void { this.queryChanges.next(this.query(this.term(), this.pageNumber())); }
  changePage(offset: number): void { this.pageNumber.update((page) => Math.max(0, page + offset)); this.reload(); }
  initials(username: string): string { return username.slice(0, 2).toUpperCase(); }
  formatDate(value: string): string { return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value)); }

  newUser(): void { this.editing.set(null); this.username.set(''); this.password.set(''); this.role.set('USER'); this.formError.set(''); this.formOpen.set(true); }
  editUser(user: Usuario): void { this.editing.set(user); this.username.set(user.username); this.password.set(''); this.role.set(user.rol); this.formError.set(''); this.formOpen.set(true); }
  isEditingSelf(): boolean { return this.editing()?.id === this.session.user()?.id; }
  closeForm(): void { if (!this.saving()) this.formOpen.set(false); }
  updateUsername(event: Event): void { this.username.set((event.target as HTMLInputElement).value); }
  updatePassword(event: Event): void { this.password.set((event.target as HTMLInputElement).value); }
  changeUserRole(event: Event): void {
    if (this.isEditingSelf()) return;
    this.role.set((event.target as HTMLSelectElement).value as RolUsuario);
  }

  save(event: SubmitEvent): void {
    event.preventDefault();
    const current = this.editing();
    if (!this.username().trim() || (!current && !this.password())) return;
    this.saving.set(true); this.formError.set('');
    const payload = { username: this.username().trim(), password: this.password() || undefined, rol: this.role() };
    const request = current ? this.api.actualizar(current.id, payload) : this.api.crear({ ...payload, password: this.password() });
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.saving.set(false); this.formOpen.set(false); this.notice.set(current ? 'Usuario actualizado.' : 'Usuario creado.'); this.reload(); },
      error: (error: unknown) => { this.saving.set(false); this.formError.set(readableApiError(error, 'No se pudo guardar el usuario.')); },
    });
  }

  deactivate(user: Usuario): void {
    if (!window.confirm(`¿Desactivar al usuario ${user.username}?`)) return;
    this.api.desactivar(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.notice.set(`Usuario ${user.username} desactivado.`); this.reload(); },
      error: (error: unknown) => { this.error.set(readableApiError(error, 'No se pudo desactivar el usuario.')); },
    });
  }

  private query(buscar: string, page: number): UsuarioQuery {
    return { buscar, estado: this.stateFilter(), rol: this.roleFilter(), page };
  }
}
