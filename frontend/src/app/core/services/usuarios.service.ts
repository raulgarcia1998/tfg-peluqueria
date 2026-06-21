// CC-BY-SA 4.0 — TFG Peluquería
// Patrón Repository: encapsula el acceso a datos de Usuarios

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, RolUsuario } from '../models/user.model';
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

  /** Admin: listar todos los usuarios con filtro opcional */
  buscarTodos(search?: string, rol?: RolUsuario): Observable<User[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (rol) params = params.set('rol', rol);

    return this.http.get<User[]>(this.API, { params }).pipe(
      catchError(() => of([]))
    );
  }

  /** Admin: actualizar rol de un usuario */
  actualizarRol(id: number, rol: RolUsuario): Observable<User> {
    return this.http.patch<User>(`${this.API}/${id}`, { rol });
  }

  /** Obtiene el perfil de un usuario por su ID */
  obtenerPorId(id: number): Observable<User> {
    return this.http.get<User>(`${this.API}/${id}`);
  }

  /** Actualiza los datos de perfil (el propio usuario o un admin) */
  actualizarPerfil(
    id: number,
    data: { nombre?: string; apellidos?: string; email?: string; telefono?: string },
  ): Observable<User> {
    return this.http.patch<User>(`${this.API}/${id}/perfil`, data);
  }
}
