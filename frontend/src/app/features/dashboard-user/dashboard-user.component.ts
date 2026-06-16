// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { USER_ROUTES } from '../../core/config/navigation.routes';

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-user.component.html'
})
export class DashboardUserComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  // Rutas de navegación centralizadas
  userRoutes = USER_ROUTES;

  nombreUsuario = computed(() => {
    const u = this.auth.currentUser();
    return u ? `${u.nombre} ${u.apellidos}` : 'Usuario';
  });

  iniciales = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return 'U';
    return `${u.nombre[0] ?? ''}${u.apellidos[0] ?? ''}`.toUpperCase();
  });

  fechaActual = computed(() => {
    return new Intl.DateTimeFormat('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(new Date());
  });

  logout(): void { 
    this.auth.logout(); 
  }
}
