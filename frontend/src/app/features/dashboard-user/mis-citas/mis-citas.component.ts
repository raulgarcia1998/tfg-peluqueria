// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService } from '../../../core/services/citas.service';
import { Cita } from '../../../core/models/cita.model';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-white mb-2">Mis Citas</h2>
        <p class="text-gray-400">Gestiona tus reservas y consulta tu historial.</p>
      </div>

      @if (cargando()) {
        <div class="flex items-center justify-center py-20 text-gray-500">
          <svg class="animate-spin w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          <span class="text-lg">Cargando tus citas...</span>
        </div>
      } @else if (citas().length === 0) {
        <div class="flex flex-col items-center justify-center py-20 text-center"
             style="background:rgba(255,255,255,.02); border:1px dashed rgba(255,255,255,0.1); border-radius: 2rem;">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mb-6"
               style="background:rgba(255,255,255,0.05)">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">No tienes citas próximas</h3>
          <p class="text-gray-500 mb-6 max-w-sm">Parece que aún no has reservado ninguna cita. ¡Anímate y reserva tu primer corte!</p>
          <button routerLink="/user/reservar"
                  class="px-8 py-3 rounded-xl font-bold text-sm text-gray-900 transition-all hover:scale-105"
                  style="background:#d4af37">
            Reservar ahora
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          @for (cita of citas(); track cita.id) {
            <div class="p-6 rounded-2xl flex flex-col sm:flex-row gap-6 relative overflow-hidden"
                 style="background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08)">
              
              <!-- Decoración lateral según estado -->
              <div class="absolute top-0 left-0 bottom-0 w-1.5" [style.background]="colorEstado(cita.estado)"></div>

              <div class="flex-1">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg"
                        [style]="estiloBadge(cita.estado)">
                    {{ cita.estado }}
                  </span>
                  <span class="text-gray-500 text-sm">Ref: #{{ cita.id }}</span>
                </div>

                <h3 class="text-xl font-bold text-white mb-1">{{ cita.servicio?.nombre ?? 'Corte de pelo' }}</h3>
                <p class="text-gray-400 text-sm mb-4">Con {{ cita.empleado?.nombre ?? 'nuestro equipo' }}</p>

                <div class="flex flex-wrap gap-4 text-sm">
                  <div class="flex items-center gap-2 text-gray-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {{ formatearFecha(cita.fechaHora) }}
                  </div>
                  <div class="flex items-center gap-2 text-gray-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {{ formatearHora(cita.fechaHora) }}
                  </div>
                </div>
              </div>

              <div class="flex sm:flex-col justify-end gap-3 shrink-0">
                @if (cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA') {
                  <button (click)="cancelarCita(cita.id)"
                          class="px-4 py-2 rounded-xl text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10"
                          style="border:1px solid rgba(239,68,68,0.2)">
                    Cancelar
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class MisCitasComponent implements OnInit {
  private citasSvc = inject(CitasService);

  citas = signal<Cita[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando.set(true);
    this.citasSvc.getMisCitas().subscribe({
      next: (data) => {
        this.citas.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  cancelarCita(id: number): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
    this.citasSvc.updateEstado(id, 'CANCELADA').subscribe({
      next: () => this.cargarCitas()
    });
  }

  formatearFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatearHora(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  colorEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return '#f59e0b';
      case 'CONFIRMADA': return '#10b981';
      case 'CANCELADA': return '#ef4444';
      case 'COMPLETADA': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  estiloBadge(estado: string): string {
    const color = this.colorEstado(estado);
    return `background: ${color}15; border: 1px solid ${color}30; color: ${color};`;
  }
}
