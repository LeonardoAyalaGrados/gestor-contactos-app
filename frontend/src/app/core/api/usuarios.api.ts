import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.generated';
import { PageResponse } from '../models/page.model';
import { EstadoUsuario, RolUsuario, Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/usuarios`;

  listar(query: { buscar: string; estado: EstadoUsuario; rol?: RolUsuario; page: number; size: number }): Observable<PageResponse<Usuario>> {
    let params = new HttpParams()
      .set('buscar', query.buscar)
      .set('estado', query.estado)
      .set('page', query.page)
      .set('size', query.size);
    if (query.rol) params = params.set('rol', query.rol);
    return this.http.get<PageResponse<Usuario>>(this.url, { params });
  }

  crear(payload: { username: string; password: string; rol: RolUsuario }): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, payload);
  }

  actualizar(id: number, payload: { username: string; password?: string; rol: RolUsuario }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, payload);
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/desactivar`, {});
  }
}
