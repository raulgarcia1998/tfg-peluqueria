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

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Obtenemos AuthService de forma perezosa para evitar dependencia circular
        const authService = injector.get(AuthService);
        authService.logout();
      } else if (error.status === 403) {
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
