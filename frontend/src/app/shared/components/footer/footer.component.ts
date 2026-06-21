// CC-BY-SA 4.0 — TFG Peluquería
// Footer global con datos de contacto del negocio, ubicación y teléfono.

import { Component } from '@angular/core';

/**
 * Datos de contacto del negocio.
 * ▸ Sustituye estos valores por los reales (teléfono, email y dirección).
 *   La URL de ubicación ya apunta a Google Maps.
 */
const INFO_NEGOCIO = {
  nombre:    'BarberPro',
  responsable: 'Equipo BarberPro',
  telefono:  '+34 600 123 456',
  email:     'contacto@barberpro.es',
  direccion: 'Calle de la Peluquería, 1 — España',
  mapsUrl:   'https://maps.app.goo.gl/4jPPUTVUcNYeTzzA8',
};

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="border-t border-white/10 bg-black text-white" role="contentinfo">
      <div class="max-w-7xl mx-auto px-6 md:px-12 py-12 grid gap-10 md:grid-cols-3">

        <!-- Marca -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/10 border border-white/20"
                 aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
              </svg>
            </div>
            <div>
              <p class="text-xl font-black tracking-tight leading-none">{{ info.nombre }}</p>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-1">Professional Grooming</p>
            </div>
          </div>
          <p class="text-sm text-white/50 leading-relaxed max-w-xs">
            Tu peluquería de confianza. Reserva tu cita online y olvídate de las esperas.
          </p>
        </div>

        <!-- Contacto -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-widest text-white/50">Contacto</h3>
          <ul class="space-y-3 text-sm">
            <li class="flex items-center gap-3 text-white/70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" class="shrink-0" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <a [href]="'tel:' + telefonoHref" class="hover:text-white transition-colors">{{ info.telefono }}</a>
            </li>
            <li class="flex items-center gap-3 text-white/70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" class="shrink-0" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <a [href]="'mailto:' + info.email" class="hover:text-white transition-colors break-all">{{ info.email }}</a>
            </li>
            <li class="flex items-center gap-3 text-white/70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" class="shrink-0" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{{ info.responsable }}</span>
            </li>
          </ul>
        </div>

        <!-- Ubicación -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-widest text-white/50">Ubicación</h3>
          <p class="flex items-start gap-3 text-sm text-white/70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" class="shrink-0 mt-0.5" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{{ info.direccion }}</span>
          </p>
          <a [href]="info.mapsUrl" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest
                    bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Cómo llegar
          </a>
        </div>
      </div>

      <!-- Barra inferior -->
      <div class="border-t border-white/10">
        <div class="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p class="text-xs text-white/40">© {{ anio }} {{ info.nombre }}. Todos los derechos reservados.</p>
          <p class="text-xs text-white/40">Hecho con cuidado para tus clientes.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`:host { display: block; }`]
})
export class FooterComponent {
  info = INFO_NEGOCIO;
  anio = new Date().getFullYear();
  // Teléfono sin espacios ni símbolos para el enlace tel:
  telefonoHref = INFO_NEGOCIO.telefono.replace(/[^\d+]/g, '');
}
