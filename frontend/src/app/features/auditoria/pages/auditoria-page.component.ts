import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { AuditoriaApi } from '../../../core/api/auditoria.api';
import { readableApiError } from '../../../core/api/api-error';
import { Auditoria } from '../../../core/models/auditoria.model';
import { PageResponse } from '../../../core/models/page.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

@Component({
  selector: 'app-auditoria-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <section class="page-heading">
      <div><p class="eyebrow">ADMINISTRACIÓN</p><h1>Auditoría</h1><p class="page-description">Historial de accesos y cambios realizados en NexoDir.</p></div>
    </section>

    <section class="surface-card">
      @if (error()) {
        <div class="notice notice-error table-message" role="alert"><span>{{ error() }}</span><button class="button button-small" type="button" (click)="load()">Reintentar</button></div>
      } @else if (loading() && !result()) {
        <div class="loading-state"><span class="spinner"></span><span>Cargando auditoría…</span></div>
      } @else if (!result()?.content?.length) {
        <app-empty-state icon="◷" title="Aún no hay eventos de auditoría" description="Los inicios de sesión y las operaciones quedarán registrados aquí." />
      } @else {
        <div class="table-scroll" [class.is-refreshing]="loading()"><table class="data-table audit-table">
          <thead><tr><th>FECHA Y HORA</th><th>ACCIÓN</th><th>ENTIDAD</th><th>REALIZADO POR</th><th>DETALLE</th></tr></thead>
          <tbody>
            @for (event of result()!.content; track event.id) {
              <tr>
                <td class="audit-date">{{ formatDate(event.timestamp) }}</td>
                <td><span class="audit-action">{{ actionLabel(event.accion) }}</span></td>
                <td><span class="role-pill">{{ event.entidad }} #{{ event.entidadId }}</span></td>
                <td><strong>{{ event.usuarioEjecutor }}</strong></td>
                <td class="audit-detail">{{ event.detalle || '—' }}</td>
              </tr>
            }
          </tbody>
        </table></div>
        <div class="pagination-row"><span>{{ result()!.totalElements }} eventos registrados</span>
          <div class="pagination-actions"><span class="page-indicator">{{ result()!.number + 1 }} / {{ result()!.totalPages || 1 }}</span><button class="button button-small" [disabled]="result()!.first || loading()" (click)="changePage(-1)">Anterior</button><button class="button button-small" [disabled]="result()!.last || loading()" (click)="changePage(1)">Siguiente</button></div>
        </div>
      }
    </section>
  `,
})
export class AuditoriaPageComponent {
  private readonly api = inject(AuditoriaApi);
  private readonly destroyRef = inject(DestroyRef);
  readonly result = signal<PageResponse<Auditoria> | null>(null);
  readonly page = signal(0);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.listar(this.page(), 20).pipe(
      catchError((error: unknown) => {
        this.error.set(readableApiError(error, 'No se pudo cargar el historial de auditoría.'));
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((result) => {
      this.loading.set(false);
      if (result) this.result.set(result);
    });
  }

  changePage(offset: number): void { this.page.update((value) => Math.max(0, value + offset)); this.load(); }
  formatDate(value: string): string { return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }

  actionLabel(action: Auditoria['accion']): string {
    const labels: Record<Auditoria['accion'], string> = {
      LOGIN: 'Inicio de sesión', CREAR: 'Crear contacto', ACTUALIZAR: 'Actualizar contacto',
      DESACTIVAR: 'Desactivar contacto', REACTIVAR: 'Reactivar contacto',
      CREAR_USUARIO: 'Crear usuario', ACTUALIZAR_USUARIO: 'Actualizar usuario', DESACTIVAR_USUARIO: 'Desactivar usuario',
    };
    return labels[action];
  }
}
