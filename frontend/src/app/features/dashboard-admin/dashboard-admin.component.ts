// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, computed } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ADMIN_ROUTES } from '../../core/config/navigation.routes';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-admin.component.html'
})
export class DashboardAdminComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  // Rutas de navegación centralizadas
  adminRoutes = ADMIN_ROUTES;

  nombreUsuario = computed(() => {
    const u = this.auth.currentUser();
    return u ? `${u.nombre} ${u.apellidos}` : 'Admin';
  });

  iniciales = computed(() => {
    const u = this.auth.currentUser();
    if (!u) return 'A';
    return `${u.nombre[0] ?? ''}${u.apellidos[0] ?? ''}`.toUpperCase();
  });

  logout(): void { 
    this.auth.logout(); 
  }
}
