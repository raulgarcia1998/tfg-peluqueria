// CC-BY-SA 4.0 — TFG Peluquería
// Patrón: Singleton — Angular garantiza instancia única en root

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User
} from '../models/user.model';
import { environment } from '../../../environments/environment';

interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
  exp: number;
}

@Injectable({ providedIn: 'root' }) // Singleton
export class AuthService {
  private readonly TOKEN_KEY = 'tfg_peluqueria_token';
  private readonly API = `${environment.apiUrl}/auth`;

  // Estado reactivo con Signals (Angular 17+)
  private _currentUser = signal<any | null>(null);
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => this._currentUser() !== null);
  
  public isAdmin = computed(() => {
    const r = this._currentUser()?.rol;
    return r === 'ADMIN' || (r && typeof r === 'object' && r.nombre === 'ADMIN');
  });

  public isEmpleado = computed(() => {
    const r = this._currentUser()?.rol;
    return r === 'EMPLEADO' || (r && typeof r === 'object' && r.nombre === 'EMPLEADO');
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.restoreSession();
  }

  /** Inicia sesión y almacena el JWT en localStorage */
  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${this.API}/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => throwError(() => err))
    );
  }

  /** Registra un nuevo usuario con rol USER por defecto */
  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(`${this.API}/register`, payload).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => throwError(() => err))
    );
  }

  /** Solicita el envío del enlace de recuperación de contraseña */
  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${this.API}/forgot-password`, { email });
  }

  /** Establece una nueva contraseña a partir del token recibido por email */
  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.API}/reset-password`, { token, newPassword });
  }

  /** Cierra sesión y redirige al login */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /** Devuelve el token JWT almacenado */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Comprueba si el token ha expirado */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  // ─── Métodos privados ──────────────────────────────────────────────────────

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    this._currentUser.set(res.user);
  }

  /** Restaura la sesión al recargar la app si el token es válido */
  private restoreSession(): void {
    if (!this.isTokenExpired()) {
      const token = this.getToken()!;
      const decoded = jwtDecode<JwtPayload>(token);
      // Recarga perfil completo; si falla, limpia la sesión
      this.http.get<User>(`${environment.apiUrl}/usuarios/${decoded.sub}`).subscribe({
        next: user => this._currentUser.set(user),
        error: () => this.logout()
      });
    }
  }
}
