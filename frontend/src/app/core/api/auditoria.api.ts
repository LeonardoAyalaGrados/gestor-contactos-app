import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.generated';
import { Auditoria } from '../models/auditoria.model';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/auditoria`;

  listar(page: number, size: number): Observable<PageResponse<Auditoria>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Auditoria>>(this.url, { params });
  }
}
