import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnDestroy, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { readableApiError } from '../../../core/api/api-error';
import { ContactosApi } from '../../../core/api/contactos.api';
import { Contacto, ContactoPayload, EstadoContacto } from '../../../core/models/contacto.model';
import { PageResponse } from '../../../core/models/page.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

interface ContactQuery { buscar: string; estado: EstadoContacto; page: number; }
interface ContactResult { data: PageResponse<Contacto> | null; error: string; }

@Component({
  selector: 'app-contactos-page',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <section class="page-heading contacts-heading">
      <div><p class="eyebrow">DIRECTORIO</p><h1>Contactos</h1><p class="page-description">Clientes y proveedores, organizados en una agenda compartida.</p></div>
      <button class="button button-primary" type="button" (click)="newContact()"><span class="button-plus">＋</span> Nuevo contacto</button>
    </section>

    @if (notice()) { <div class="notice notice-success" role="status"><span class="notice-check">✓</span>{{ notice() }}<button type="button" class="notice-close" aria-label="Cerrar" (click)="notice.set('')">×</button></div> }

    <section class="surface-card contacts-card">
      <div class="list-toolbar">
        <label class="search-box" for="contact-search">
          <span class="search-icon">⌕</span>
          <input id="contact-search" type="search" placeholder="Buscar por nombre, apellido o DNI..." [value]="term()" (input)="search($event)" />
          @if (term()) { <button class="clear-search" type="button" aria-label="Limpiar búsqueda" (click)="clearSearch()">×</button> }
        </label>
        <div class="toolbar-right">
          <label class="filter-label" for="contact-state">Estado</label>
          <select id="contact-state" class="select-input" [value]="stateFilter()" (change)="changeState($event)">
            <option value="ACTIVO">Activos</option><option value="INACTIVO">Inactivos</option>
          </select>
          <span class="toolbar-count">{{ result()?.totalElements ?? 0 }} registros</span>
        </div>
      </div>

      @if (error()) {
        <div class="notice notice-error table-message" role="alert"><span>{{ error() }}</span><button class="button button-small" type="button" (click)="reload()">Reintentar</button></div>
      } @else if (loading() && !result()) {
        <div class="loading-state"><span class="spinner"></span><span>Cargando contactos…</span></div>
      } @else if (!result()?.content?.length) {
        <app-empty-state icon="♧" [title]="term() ? 'No encontramos coincidencias' : 'Tu agenda está lista para comenzar'"
          [description]="term() ? 'Prueba con otro nombre o DNI.' : 'Agrega tu primer cliente o proveedor para verlo aquí.'"
          [actionLabel]="!term() && stateFilter() === 'ACTIVO' ? 'Agregar contacto' : ''" (action)="newContact()" />
      } @else {
        <div class="table-scroll" [class.is-refreshing]="loading()"><table class="data-table contacts-table">
          <thead><tr><th>CONTACTO</th><th>DNI</th><th>TELÉFONO</th><th>CORREO</th><th>ESTADO</th><th class="table-actions-heading"></th></tr></thead>
          <tbody>
            @for (contacto of result()!.content; track contacto.id) {
              <tr>
                <td><button class="contact-cell contact-link" type="button" (click)="showDetail(contacto)"><span class="avatar contact-avatar">{{ initials(contacto.nombres, contacto.apellidos) }}</span><span><strong>{{ contacto.nombres }} {{ contacto.apellidos }}</strong><small>Ver ficha de contacto</small></span></button></td>
                <td class="mono-cell">{{ contacto.dni }}</td>
                <td>{{ contacto.telefonos[0] || '—' }}@if (contacto.telefonos.length > 1) { <small class="extra-count">+{{ contacto.telefonos.length - 1 }}</small> }</td>
                <td class="email-cell">{{ contacto.correos[0] || '—' }}@if (contacto.correos.length > 1) { <small class="extra-count">+{{ contacto.correos.length - 1 }}</small> }</td>
                <td><span class="status-pill" [class.status-active]="contacto.estado === 'ACTIVO'">{{ contacto.estado === 'ACTIVO' ? 'Activo' : 'Inactivo' }}</span></td>
                <td><button class="icon-button" type="button" [attr.aria-label]="'Ver opciones de ' + contacto.nombres" (click)="showDetail(contacto)">···</button></td>
              </tr>
            }
          </tbody>
        </table></div>
        <div class="pagination-row"><span>Mostrando {{ result()!.content.length }} de {{ result()!.totalElements }} contactos</span>
          <div class="pagination-actions"><span class="page-indicator">{{ result()!.number + 1 }} / {{ result()!.totalPages || 1 }}</span><button class="button button-small" [disabled]="result()!.first || loading()" (click)="changePage(-1)">Anterior</button><button class="button button-small" [disabled]="result()!.last || loading()" (click)="changePage(1)">Siguiente</button></div>
        </div>
      }
    </section>

    @if (selected()) {
      <div class="overlay" (click)="closeDetail()" (keydown.escape)="closeDetail()">
        <aside class="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title" (click)="$event.stopPropagation()">
          <div class="panel-topline"><span class="eyebrow">FICHA DE CONTACTO</span><button class="icon-button close-button" type="button" aria-label="Cerrar ficha" (click)="closeDetail()">×</button></div>
          @if (detailLoading()) { <div class="loading-state"><span class="spinner"></span><span>Cargando ficha…</span></div> }
          @if (selected(); as contacto) {
            <div class="detail-person">
              @if (photoUrl()) { <img class="detail-photo" [src]="photoUrl()!" alt="Fotografía de contacto" /> } @else { <span class="avatar detail-avatar">{{ initials(contacto.nombres, contacto.apellidos) }}</span> }
              <h2 id="detail-title">{{ contacto.nombres }} {{ contacto.apellidos }}</h2><span class="status-pill" [class.status-active]="contacto.estado === 'ACTIVO'">{{ contacto.estado === 'ACTIVO' ? 'Activo' : 'Inactivo' }}</span>
            </div>
            @if (detailError()) { <p class="detail-hint">{{ detailError() }}</p> }
            <div class="detail-section"><p class="eyebrow">INFORMACIÓN PERSONAL</p><div class="detail-row"><span>DNI</span><strong>{{ contacto.dni }}</strong></div></div>
            <div class="detail-section"><p class="eyebrow">TELÉFONOS</p>@for (tel of contacto.telefonos; track $index) { <div class="detail-row"><span>Teléfono {{ $index + 1 }}</span><strong>{{ tel }}</strong></div> } @empty { <div class="detail-row"><span>Sin teléfonos registrados</span></div> }</div>
            <div class="detail-section"><p class="eyebrow">CORREOS ELECTRÓNICOS</p>@for (correo of contacto.correos; track $index) { <div class="detail-row"><span>Correo {{ $index + 1 }}</span><strong class="detail-email">{{ correo }}</strong></div> } @empty { <div class="detail-row"><span>Sin correos registrados</span></div> }</div>
            <div class="detail-actions">
              @if (contacto.estado === 'ACTIVO') { <button class="button button-primary" type="button" (click)="editContact(contacto)">Editar contacto</button><button class="button button-danger-quiet" type="button" (click)="changeContactState(contacto)">Desactivar</button> }
              @else { <button class="button button-primary" type="button" (click)="changeContactState(contacto)">Reactivar contacto</button> }
            </div>
          }
        </aside>
      </div>
    }

    @if (formOpen()) {
      <div class="overlay modal-overlay" (click)="closeForm()" (keydown.escape)="closeForm()">
        <section class="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-form-title" (click)="$event.stopPropagation()">
          <div class="modal-heading"><div><p class="eyebrow">{{ editing() ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO' }}</p><h2 id="contact-form-title">{{ editing() ? 'Editar contacto' : 'Agregar contacto' }}</h2></div><button class="icon-button close-button" type="button" aria-label="Cerrar formulario" (click)="closeForm()">×</button></div>
          @if (formError()) { <div class="notice notice-error" role="alert">{{ formError() }}</div> }
          <form (submit)="saveContact($event)" novalidate>
            <div class="form-grid"><label class="form-field"><span>DNI <b>*</b></span><input class="text-input" name="dni" [value]="dni()" (input)="updateDni($event)" (blur)="touch('dni')" inputmode="numeric" maxlength="8" placeholder="8 dígitos" required [attr.aria-invalid]="showError('dni')" />@if (showError('dni')) { <small class="field-error">Ingresa exactamente 8 dígitos.</small> }</label>
              <label class="form-field"><span>Nombres <b>*</b></span><input class="text-input" name="nombres" [value]="nombres()" (input)="updateLetters('nombres', $event)" (blur)="touch('nombres')" maxlength="150" placeholder="Nombres" required [attr.aria-invalid]="showError('nombres')" />@if (showError('nombres')) { <small class="field-error">Usa letras y espacios; debe contener al menos una letra.</small> }</label>
              <label class="form-field form-field-wide"><span>Apellidos <b>*</b></span><input class="text-input" name="apellidos" [value]="apellidos()" (input)="updateLetters('apellidos', $event)" (blur)="touch('apellidos')" maxlength="150" placeholder="Apellidos" required [attr.aria-invalid]="showError('apellidos')" />@if (showError('apellidos')) { <small class="field-error">Usa letras y espacios; debe contener al menos una letra.</small> }</label>
            </div>

            <div class="form-section-heading"><div><h3>Teléfonos</h3><p>Números móviles de 9 dígitos que comienzan en 9.</p></div><button class="text-button" type="button" (click)="addPhone()">＋ Añadir</button></div>
            <div class="repeated-fields">@for (phone of phones(); track $index; let i = $index) { <div class="repeated-field"><input class="text-input" name="telefonos" [value]="phone" (input)="updatePhone(i, $event)" (blur)="touch('channels')" inputmode="numeric" maxlength="9" placeholder="912345678" [attr.aria-invalid]="phone.length > 0 && !validPhone(phone)" /><button class="remove-field" type="button" [disabled]="phones().length === 1" [attr.aria-label]="'Quitar teléfono ' + (i + 1)" (click)="removePhone(i)">×</button></div>@if (phone && !validPhone(phone)) { <small class="field-error">El teléfono debe tener 9 dígitos y comenzar en 9.</small> } }</div>

            <div class="form-section-heading"><div><h3>Correos electrónicos</h3><p>Puedes agregar más de una dirección.</p></div><button class="text-button" type="button" (click)="addEmail()">＋ Añadir</button></div>
            <div class="repeated-fields">@for (email of emails(); track $index; let i = $index) { <div class="repeated-field"><input class="text-input" name="correos" [value]="email" (input)="updateEmail(i, $event)" (blur)="touch('channels')" type="email" maxlength="254" placeholder="nombre@empresa.com" [attr.aria-invalid]="email.length > 0 && !validEmail(email)" /><button class="remove-field" type="button" [disabled]="emails().length === 1" [attr.aria-label]="'Quitar correo ' + (i + 1)" (click)="removeEmail(i)">×</button></div>@if (email && !validEmail(email)) { <small class="field-error">Ingresa un correo con formato válido.</small> } @else if (email && duplicateEmail(i)) { <small class="field-error">Este correo ya está agregado.</small> } }</div>
            @if (showError('channels')) { <small class="field-error channel-error">Agrega al menos un teléfono o un correo válido.</small> }

            <label class="form-field photo-field"><span>Fotografía {{ editing() ? '(opcional al editar)' : '*' }}</span><input class="file-input" name="foto" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" (change)="updatePhoto($event)" (blur)="touch('photo')" [required]="!editing()" />@if (showError('photo')) { <small class="field-error">Selecciona una imagen JPG, PNG o WEBP de hasta 2 MB.</small> } @else { <small>JPG, PNG o WEBP · máximo 2 MB</small> }</label>
            <div class="modal-actions"><button class="button button-quiet" type="button" [disabled]="saving()" (click)="closeForm()">Cancelar</button><button class="button button-primary" type="submit" [disabled]="saving() || !formValid()">{{ saving() ? 'Guardando…' : editing() ? 'Guardar cambios' : 'Crear contacto' }}</button></div>
          </form>
        </section>
      </div>
    }
  `,
})
export class ContactosPageComponent implements OnDestroy {
  private readonly api = inject(ContactosApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryChanges = new Subject<ContactQuery>();
  private currentPhotoUrl: string | null = null;

  readonly term = signal('');
  readonly stateFilter = signal<EstadoContacto>('ACTIVO');
  readonly pageNumber = signal(0);
  readonly result = signal<PageResponse<Contacto> | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly notice = signal('');
  readonly selected = signal<Contacto | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal('');
  readonly photoUrl = signal<string | null>(null);
  readonly formOpen = signal(false);
  readonly editing = signal<Contacto | null>(null);
  readonly phones = signal<string[]>(['']);
  readonly emails = signal<string[]>(['']);
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly dni = signal('');
  readonly nombres = signal('');
  readonly apellidos = signal('');
  readonly photoFile = signal<File | null>(null);
  readonly touched = signal<Record<string, boolean>>({});
  readonly formValid = computed(() => this.validDni(this.dni()) && this.validLetters(this.nombres()) && this.validLetters(this.apellidos()) && this.validChannels() && (this.editing() !== null || this.validPhoto(this.photoFile())));

  constructor() {
    this.queryChanges.pipe(
      startWith({ buscar: '', estado: 'ACTIVO' as EstadoContacto, page: 0 }),
      debounceTime(300),
      tap(() => { this.loading.set(true); this.error.set(''); }),
      switchMap((query) => this.api.listar({ ...query, size: 20 }).pipe(
        map((data): ContactResult => ({ data, error: '' })),
        catchError((err: unknown) => of({ data: null, error: readableApiError(err, 'No se pudieron cargar los contactos.') })),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      this.loading.set(false);
      if (response.data) this.result.set(response.data);
      else this.error.set(response.error);
    });
  }

  ngOnDestroy(): void { this.revokePhotoUrl(); }

  search(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.term.set(value);
    this.pageNumber.set(0);
    this.dispatchQuery(0);
  }

  clearSearch(): void { this.term.set(''); this.pageNumber.set(0); this.dispatchQuery(0); }

  changeState(event: Event): void {
    this.stateFilter.set((event.target as HTMLSelectElement).value as EstadoContacto);
    this.pageNumber.set(0);
    this.dispatchQuery(0);
  }

  reload(): void { this.dispatchQuery(this.pageNumber()); }
  changePage(offset: number): void { this.pageNumber.update((page) => Math.max(0, page + offset)); this.reload(); }

  newContact(): void {
    this.editing.set(null);
    this.dni.set(''); this.nombres.set(''); this.apellidos.set(''); this.photoFile.set(null); this.touched.set({});
    this.phones.set(['']);
    this.emails.set(['']);
    this.formError.set('');
    this.formOpen.set(true);
  }

  showDetail(contacto: Contacto): void {
    this.revokePhotoUrl();
    this.selected.set(contacto);
    this.detailLoading.set(true);
    this.detailError.set('');
    this.api.obtener(contacto.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (detalle) => { this.selected.set(detalle); this.detailLoading.set(false); },
      error: (error: unknown) => { this.detailLoading.set(false); this.detailError.set(readableApiError(error, 'No se pudo cargar la ficha.')); },
    });
    this.api.fotografia(contacto.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (photo) => { this.revokePhotoUrl(); this.currentPhotoUrl = URL.createObjectURL(photo); this.photoUrl.set(this.currentPhotoUrl); },
      error: () => { this.detailError.set('La fotografía no está disponible.'); },
    });
  }

  closeDetail(): void { this.selected.set(null); this.revokePhotoUrl(); }

  editContact(contacto: Contacto): void {
    this.editing.set(contacto);
    this.dni.set(contacto.dni); this.nombres.set(contacto.nombres); this.apellidos.set(contacto.apellidos); this.photoFile.set(null); this.touched.set({});
    this.phones.set(contacto.telefonos.length ? [...contacto.telefonos] : ['']);
    this.emails.set(contacto.correos.length ? [...contacto.correos] : ['']);
    this.formError.set('');
    this.formOpen.set(true);
    this.closeDetail();
  }

  closeForm(): void { if (!this.saving()) this.formOpen.set(false); }

  addPhone(): void { this.phones.update((items) => [...items, '']); }
  addEmail(): void { this.emails.update((items) => [...items, '']); }
  removePhone(index: number): void { this.phones.update((items) => items.filter((_, itemIndex) => itemIndex !== index)); }
  removeEmail(index: number): void { this.emails.update((items) => items.filter((_, itemIndex) => itemIndex !== index)); }
  updatePhone(index: number, event: Event): void { const input = event.target as HTMLInputElement; const value = input.value.replace(/\D/g, '').slice(0, 9); input.value = value; this.updateValue(this.phones, index, value); }
  updateEmail(index: number, event: Event): void { this.updateValue(this.emails, index, (event.target as HTMLInputElement).value); }
  updateDni(event: Event): void { const input = event.target as HTMLInputElement; const value = input.value.replace(/\D/g, '').slice(0, 8); input.value = value; this.dni.set(value); }
  updateLetters(field: 'nombres' | 'apellidos', event: Event): void { const input = event.target as HTMLInputElement; const value = input.value.replace(/[^\p{L}\s]/gu, '').replace(/\s{2,}/g, ' '); input.value = value; (field === 'nombres' ? this.nombres : this.apellidos).set(value); }
  updatePhoto(event: Event): void { this.photoFile.set((event.target as HTMLInputElement).files?.[0] ?? null); }
  touch(field: string): void { this.touched.update((state) => ({ ...state, [field]: true })); }
  showError(field: string): boolean { return !!this.touched()[field] && !this.fieldValid(field); }
  validPhone(value: string): boolean { return /^9\d{8}$/.test(value); }
  validEmail(value: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254; }
  duplicateEmail(index: number): boolean { const value = this.emails()[index].trim().toLowerCase(); return !!value && this.emails().some((email, other) => other !== index && email.trim().toLowerCase() === value); }

  saveContact(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    this.touch('dni'); this.touch('nombres'); this.touch('apellidos'); this.touch('channels'); this.touch('photo');
    if (!this.formValid()) return;
    const formData = new FormData(form);
    const telefonos = formData.getAll('telefonos').map(String).map((value) => value.trim()).filter(Boolean);
    const correos = formData.getAll('correos').map(String).map((value) => value.trim()).filter(Boolean);
    if (!this.formValid()) { this.formError.set('Corrige los campos indicados antes de guardar.'); return; }

    const payload: ContactoPayload = {
      dni: this.dni().trim(),
      nombres: this.nombres().trim(),
      apellidos: this.apellidos().trim(),
      telefonos,
      correos,
    };
    const selectedFile = formData.get('foto');
    const photo = selectedFile instanceof File && selectedFile.size ? selectedFile : undefined;
    const current = this.editing();
    if (!current && !photo) { this.formError.set('Selecciona una fotografía para crear el contacto.'); return; }
    if (photo && !this.validPhoto(photo)) { this.formError.set('La fotografía debe ser JPG, PNG o WEBP y no superar los 2 MB.'); return; }

    this.saving.set(true);
    this.formError.set('');
    const request = current ? this.api.actualizar(current.id, payload, photo) : this.api.crear(payload, photo!);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.notice.set(current ? 'Los cambios del contacto se guardaron.' : 'El contacto se creó correctamente.');
        this.dispatchQuery(this.pageNumber());
      },
      error: (error: unknown) => { this.saving.set(false); this.formError.set(readableApiError(error, 'No se pudo guardar el contacto.')); },
    });
  }

  changeContactState(contacto: Contacto): void {
    const request = contacto.estado === 'ACTIVO' ? this.api.desactivar(contacto.id) : this.api.reactivar(contacto.id);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notice.set(contacto.estado === 'ACTIVO' ? 'El contacto se desactivó.' : 'El contacto se reactivó.');
        this.closeDetail();
        this.dispatchQuery(this.pageNumber());
      },
      error: (error: unknown) => { this.detailError.set(readableApiError(error, 'No se pudo actualizar el estado del contacto.')); },
    });
  }

  initials(nombres: string, apellidos: string): string {
    return `${nombres.trim().charAt(0)}${apellidos.trim().charAt(0)}`.toUpperCase();
  }

  private dispatchQuery(page: number): void {
    this.queryChanges.next({ buscar: this.term(), estado: this.stateFilter(), page });
  }

  private updateValue(target: WritableSignal<string[]>, index: number, value: string): void {
    target.update((items) => items.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  private validDni(value: string): boolean { return /^\d{8}$/.test(value); }
  private validLetters(value: string): boolean { return /^(?=.*\p{L})[\p{L}]+(?:[ \u00A0][\p{L}]+)*$/u.test(value.trim()); }
  private validChannels(): boolean {
    const phones = this.phones().map((value) => value.trim()).filter(Boolean);
    const emails = this.emails().map((value) => value.trim()).filter(Boolean);
    return phones.every((phone) => this.validPhone(phone)) && emails.every((email) => this.validEmail(email)) && emails.every((email, index) => !emails.some((other, otherIndex) => index !== otherIndex && email.toLowerCase() === other.toLowerCase())) && (phones.length > 0 || emails.length > 0);
  }
  private validPhoto(file: File | null): boolean { return !!file && file.size <= 2 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type); }
  private fieldValid(field: string): boolean {
    if (field === 'dni') return this.validDni(this.dni());
    if (field === 'nombres') return this.validLetters(this.nombres());
    if (field === 'apellidos') return this.validLetters(this.apellidos());
    if (field === 'channels') return this.validChannels();
    if (field === 'photo') return this.editing() !== null || this.validPhoto(this.photoFile());
    return true;
  }

  private revokePhotoUrl(): void {
    if (this.currentPhotoUrl) URL.revokeObjectURL(this.currentPhotoUrl);
    this.currentPhotoUrl = null;
    this.photoUrl.set(null);
  }
}
