import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HEADER_ROUTES, NavigationRoute } from '../../../core/config/navigation.routes';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Skip to content (WCAG 2.4.1) -->
    <a href="#main-content"
       class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200]
              focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-gray-900 focus:font-bold text-sm">
      Saltar al contenido
    </a>

    <header class="h-20 px-6 md:px-12 flex items-center justify-between border-b border-white/10 bg-black text-white backdrop-blur-xl sticky top-0 z-[100]"
            role="banner">
      <div class="flex items-center gap-10">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl"
           aria-label="BarberPro – inicio">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/10 border border-white/20"
               aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" aria-hidden="true">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="hidden sm:block">
            <span class="text-xl font-black tracking-tight leading-none text-white">BarberPro</span>
            <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-1">Professional Grooming</p>
          </div>
        </a>

        <!-- Navigation from centralized config -->
        <nav class="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          @for (route of visibleRoutes(); track route.path) {
            <a [routerLink]="route.path"
               routerLinkActive="!text-white bg-white/10"
               [routerLinkActiveOptions]="{ exact: false }"
               class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              {{ route.label }}
            </a>
          }
        </nav>
      </div>

      <div class="flex items-center gap-4">
        @if (isLoggedIn()) {
          <div class="flex items-center gap-3 pr-4 border-r border-white/10 hidden sm:flex" aria-live="polite">
            <div class="text-right">
              <p class="text-[10px] font-black text-white uppercase">{{ currentUser()?.nombre }}</p>
              <p class="text-[9px] font-bold text-white/60 uppercase tracking-tighter">{{ currentUser()?.rol }}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-900 font-black text-xs"
                 aria-hidden="true">
              {{ currentUser()?.nombre?.[0] }}
            </div>
          </div>
          <button (click)="logout()"
             aria-label="Cerrar sesión"
             class="p-2 rounded-xl bg-white/10 border border-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/15 hover:border-red-500/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        } @else {
          <a routerLink="/login"
             class="px-6 py-2.5 rounded-xl bg-white text-gray-900 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 hover:scale-105 transition-all shadow-lg shadow-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            Iniciar Sesión
          </a>
        }
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class HeaderComponent {
  private authSvc = inject(AuthService);

  isLoggedIn = this.authSvc.isAuthenticated;
  isAdmin    = this.authSvc.isAdmin;
  currentUser = this.authSvc.currentUser;

  // Filtra rutas visibles según el rol del usuario
  visibleRoutes = computed((): NavigationRoute[] => {
    const isAuthenticated = this.isLoggedIn();
    const isAdminUser = this.isAdmin();

    return HEADER_ROUTES.filter(route => {
      if (isAdminUser) return route.roles.includes('ADMIN');
      if (isAuthenticated) return route.roles.includes('USER');
      return route.roles.includes('PUBLIC');
    });
  });

  logout() {
    this.authSvc.logout();
  }
}
