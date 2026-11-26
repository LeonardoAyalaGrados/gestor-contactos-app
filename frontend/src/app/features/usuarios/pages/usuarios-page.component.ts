import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { readableApiError } from '../../../core/api/api-error';
import { UsuariosApi } from '../../../core/api/usuarios.api';
import { PageResponse } from '../../../core/models/page.model';
import { Usuario } from '../../../core/models/usuario.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

interface UsuarioQuery { buscar: string; estado: 'ACTIVO' | 'INACTIVO'; rol: 'TODOS' | 'USER' | 'ADMIN'; page: number; }
interface UsuarioResult { data: PageResponse<Usuario> | null; error: string; }

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <section class="page-heading">
      <div><p class="eyebrow">DIRECTORIO</p><h1>Usuarios</h1><p class="page-description">Consulta las cuentas y sus roles de acceso.</p></div>
    </section>

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
          <thead><tr><th>USUARIO</th><th>ROL</th><th>ESTADO</th><th>ALTA</th></tr></thead>
          <tbody>
            @for (usuario of result()!.content; track usuario.id) {
              <tr>
                <td><div class="user-cell"><span class="avatar">{{ initials(usuario.username) }}</span><strong>{{ usuario.username }}</strong></div></td>
                <td><span class="role-pill" [class.role-admin]="usuario.rol === 'ADMIN'">{{ usuario.rol }}</span></td>
                <td><span class="status-pill" [class.status-active]="usuario.estado === 'ACTIVO'">{{ usuario.estado }}</span></td>
                <td class="muted-cell">{{ formatDate(usuario.createdAt) }}</td>
              </tr>
            }
          </tbody>
        </table></div>
        <div class="pagination-row"><span>Página {{ result()!.number + 1 }} de {{ result()!.totalPages || 1 }}</span>
          <div class="pagination-actions"><button class="button button-small" [disabled]="result()!.first" (click)="changePage(-1)">Anterior</button><button class="button button-small" [disabled]="result()!.last" (click)="changePage(1)">Siguiente</button></div>
        </div>
      }
    </section>
    <p class="page-footnote">La creación y edición de usuarios está disponible en el backend; esta vista inicial es de consulta.</p>
  `,
})
export class UsuariosPageComponent {
  private readonly api = inject(UsuariosApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryChanges = new Subject<UsuarioQuery>();

  readonly term = signal('');
  readonly stateFilter = signal<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  readonly roleFilter = signal<'TODOS' | 'USER' | 'ADMIN'>('TODOS');
  readonly pageNumber = signal(0);
  readonly result = signal<PageResponse<Usuario> | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

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

  private query(buscar: string, page: number): UsuarioQuery {
    return { buscar, estado: this.stateFilter(), rol: this.roleFilter(), page };
  }
}
