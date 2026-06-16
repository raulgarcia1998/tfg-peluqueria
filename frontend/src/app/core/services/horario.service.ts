// CC-BY-SA 4.0 — TFG Peluquería
// Patrón Repository: encapsula toda la lógica de acceso a datos de Horarios

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  HorarioLaboral,
  HorarioDisponibilidad,
  MesDisponibilidad
} from '../models/horario.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly API = `${environment.apiUrl}/horarios`;
  private http = inject(HttpClient);

  /** Admin: lista de horarios laborales de un mes (con franjas) */
  getHorariosMes(anio: number, mes: number): Observable<HorarioLaboral[]> {
    const params = new HttpParams()
      .set('anio', anio.toString())
      .set('mes', mes.toString());
    return this.http.get<HorarioLaboral[]>(this.API, { params }).pipe(
      catchError(() => of([]))
    );
  }

  /** Admin: crea horario para un día (con sus franjas) */
  crearHorario(dto: Omit<HorarioLaboral, 'id'>): Observable<HorarioLaboral> {
    return this.http.post<HorarioLaboral>(this.API, dto);
  }

  /** Admin: actualiza horario de un día (reemplaza franjas) */
  actualizarHorario(id: number, dto: Partial<HorarioLaboral>): Observable<HorarioLaboral> {
    return this.http.put<HorarioLaboral>(`${this.API}/${id}`, dto);
  }

  /** Admin: elimina horario de un día */
  eliminarHorario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }


  /** Usuario: estado de disponibilidad de cada día del mes */
  getDiasDisponiblesMes(anio: number, mes: number): Observable<MesDisponibilidad> {
    const params = new HttpParams()
      .set('anio', anio.toString())
      .set('mes', mes.toString());
    return this.http
      .get<MesDisponibilidad>(`${this.API}/disponibilidad/mes`, { params })
      .pipe(catchError(() => of({})));
  }

  /** Usuario: slots de un día concreto, agrupados por franja horaria */
  getDisponibilidadDia(fecha: string, duracion?: number): Observable<HorarioDisponibilidad> {
    let params = new HttpParams();
    if (duracion) params = params.set('duracion', duracion.toString());

    return this.http
      .get<HorarioDisponibilidad>(`${this.API}/disponibilidad/dia/${fecha}`, { params })
      .pipe(catchError(() => of({ fecha, bloques: [], slots: [] })));
  }
}
