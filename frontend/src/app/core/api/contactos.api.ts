import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.generated';
import { PageResponse } from '../models/page.model';
import { Contacto, ContactoPayload, EstadoContacto } from '../models/contacto.model';

@Injectable({ providedIn: 'root' })
export class ContactosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/contactos`;

  listar(query: { buscar: string; estado: EstadoContacto; page: number; size: number }): Observable<PageResponse<Contacto>> {
    const params = new HttpParams()
      .set('buscar', query.buscar)
      .set('estado', query.estado)
      .set('page', query.page)
      .set('size', query.size);
    return this.http.get<PageResponse<Contacto>>(this.url, { params });
  }

  obtener(id: number): Observable<Contacto> {
    return this.http.get<Contacto>(`${this.url}/${id}`);
  }

  crear(contacto: ContactoPayload, foto: File): Observable<Contacto> {
    return this.http.post<Contacto>(this.url, this.multipart(contacto, foto));
  }

  actualizar(id: number, contacto: ContactoPayload, foto?: File): Observable<Contacto> {
    return this.http.put<Contacto>(`${this.url}/${id}`, this.multipart(contacto, foto));
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/desactivar`, {});
  }

  reactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/reactivar`, {});
  }

  fotografia(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/foto`, { responseType: 'blob' });
  }

  private multipart(contacto: ContactoPayload, foto?: File): FormData {
    const body = new FormData();
    body.append('contacto', new Blob([JSON.stringify(contacto)], { type: 'application/json' }));
    if (foto) body.append('foto', foto, foto.name);
    return body;
  }
}
