import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const injector = inject(Injector);

  // Endpoints públicos de auth: un 401/403 aquí es "credenciales inválidas",
  // no una sesión expirada — no debe disparar logout() ni redirigir.
  const isAuthEndpoint = /\/auth\/(login|register|forgot-password|reset-password)$/.test(req.url);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        // Obtenemos AuthService de forma perezosa para evitar dependencia circular
        const authService = injector.get(AuthService);
        authService.logout();
      } else if (error.status === 403 && !isAuthEndpoint) {
        router.navigate(['/acceso-denegado']);
      } else if (error.status === 404) {
        console.warn('[ErrorInterceptor] Recurso no encontrado:', req.url);
      } else if (error.status >= 500) {
        console.error('[ErrorInterceptor] Error del servidor:', error.message);
      }
      return throwError(() => error);
    })
  );
};
