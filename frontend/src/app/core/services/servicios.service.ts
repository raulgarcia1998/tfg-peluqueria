// CC-BY-SA 4.0 — TFG Peluquería

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Servicio } from '../models/servicio.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly API = `${environment.apiUrl}/servicios`;
  private http = inject(HttpClient);

  getAll(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.API).pipe(
      catchError(() => of([]))
    );
  }

  getById(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.API}/${id}`);
  }

  create(dto: Omit<Servicio, 'id'>): Observable<Servicio> {
    return this.http.post<Servicio>(this.API, dto);
  }

  update(id: number, dto: Partial<Servicio>): Observable<Servicio> {
    return this.http.patch<Servicio>(`${this.API}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
