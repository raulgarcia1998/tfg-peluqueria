// CC-BY-SA 4.0 — TFG Peluquería
// Patrón Repository: encapsula toda la lógica de acceso a datos de Citas

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita, CitaFilter, CreateCitaDto, EstadoCita } from '../models/cita.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CitasService {
  private readonly API = `${environment.apiUrl}/citas`;
  private http = inject(HttpClient);

  getAll(filter?: CitaFilter): Observable<Cita[]> {
    let params = new HttpParams();
    if (filter?.search)     params = params.set('search', filter.search);
    if (filter?.estado)     params = params.set('estado', filter.estado);
    if (filter?.fechaDesde) params = params.set('fechaDesde', filter.fechaDesde);
    if (filter?.fechaHasta) params = params.set('fechaHasta', filter.fechaHasta);
    if (filter?.servicioId) params = params.set('servicioId', filter.servicioId.toString());

    return this.http.get<Cita[]>(this.API, { params });
  }

  getById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.API}/${id}`);
  }

  getMisCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.API}/mis-citas`);
  }

  create(dto: CreateCitaDto): Observable<Cita> {
    return this.http.post<Cita>(this.API, dto);
  }

  update(id: number, dto: Partial<CreateCitaDto> & { estado?: EstadoCita }): Observable<Cita> {
    return this.http.patch<Cita>(`${this.API}/${id}`, dto);
  }

  updateEstado(id: number, estado: EstadoCita): Observable<Cita> {
    return this.http.patch<Cita>(`${this.API}/${id}/estado`, { estado });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
