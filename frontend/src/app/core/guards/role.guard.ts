// CC-BY-SA 4.0 — TFG Peluquería
// Patrón Guard: protege rutas según el rol del usuario autenticado

import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles: string[] = route.data['roles'] ?? [];

  const r = authService.currentUser()?.rol;
  const userRole = typeof r === 'string' ? r : r?.nombre;
  
  if (requiredRoles.includes(userRole ?? '')) {
    return true;
  }

  return router.parseUrl('/acceso-denegado');
};
