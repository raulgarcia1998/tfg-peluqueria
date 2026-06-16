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
    <header class="h-20 px-6 md:px-12 flex items-center justify-between border-b border-white/5 bg-[#0f0f1a]/80 backdrop-blur-xl sticky top-0 z-[100]">
      <div class="flex items-center gap-10">
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer" routerLink="/">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#d4af37]/10 border border-[#d4af37]/30 shadow-lg shadow-[#d4af37]/5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-xl font-black tracking-tight leading-none text-white">BarberPro</h1>
            <p class="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]/80 mt-1">Professional Grooming</p>
          </div>
        </div>

        <!-- Navigation from centralized config -->
        <nav class="hidden md:flex items-center gap-1">
          @for (route of visibleRoutes(); track route.path) {
            <a [routerLink]="route.path"
               routerLinkActive="text-[#d4af37] bg-white/5"
               class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all">
              {{ route.label }}
            </a>
          }
        </nav>
      </div>

      <div class="flex items-center gap-4">
        @if (isLoggedIn()) {
          <div class="flex items-center gap-3 pr-4 border-r border-white/10 hidden sm:flex">
            <div class="text-right">
              <p class="text-[10px] font-black text-white uppercase">{{ currentUser()?.nombre }}</p>
              <p class="text-[9px] font-bold text-[#d4af37] uppercase tracking-tighter">{{ currentUser()?.rol?.nombre }}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f0c952] flex items-center justify-center text-[#0f0f1a] font-black text-xs">
              {{ currentUser()?.nombre?.[0] }}
            </div>
          </div>
          <button (click)="logout()" 
             class="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        } @else {
          <a routerLink="/login" 
             class="px-6 py-2.5 rounded-xl bg-[#d4af37] text-[#0f0f1a] text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#d4af37]/20">
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
