// CC-BY-SA 4.0 — TFG Peluquería
// Patrón Repository: encapsula el acceso a datos de Usuarios

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly API = `${environment.apiUrl}/usuarios`;
  private http = inject(HttpClient);

  /** Admin/Empleado: busca clientes (rol USER) por nombre, apellidos, email o teléfono */
  buscarClientes(search?: string): Observable<User[]> {
    let params = new HttpParams().set('rol', 'USER');
    if (search) params = params.set('search', search);

    return this.http.get<User[]>(this.API, { params }).pipe(
      catchError(() => of([]))
    );
  }
}
