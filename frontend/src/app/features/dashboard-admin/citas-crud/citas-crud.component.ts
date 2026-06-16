// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService } from '../../../core/services/citas.service';
import { Cita, EstadoCita } from '../../../core/models/cita.model';

@Component({
  selector: 'app-citas-crud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-white mb-2">Citas y Reservas</h2>
        <p class="text-gray-400">Control de todas las citas de la peluquería.</p>
      </div>

      <!-- Filtros rápidos (MOCK) -->
      <div class="flex flex-wrap gap-4 mb-8">
        @for (f of ['TODAS', 'PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']; track f) {
          <button (click)="filtrar(f)"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all border"
                  [style]="filtroActual() === f ? estiloFiltroActivo(f) : estiloFiltroInactivo()">
            {{ f }}
          </button>
        }
      </div>

      @if (cargando()) {
        <div class="flex items-center justify-center py-20 text-gray-500">
          <svg class="animate-spin w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          <span class="text-lg">Cargando citas...</span>
        </div>
      } @else if (citasFiltradas().length === 0) {
        <div class="py-20 text-center text-gray-500 bg-white/5 rounded-3xl border border-white/10">
          No hay citas que coincidan con el filtro.
        </div>
      } @else {
        <div class="overflow-x-auto rounded-2xl border border-white/10" style="background:rgba(255,255,255,.02)">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <th class="px-6 py-4">Cliente</th>
                <th class="px-6 py-4">Servicio</th>
                <th class="px-6 py-4">Fecha y Hora</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (c of citasFiltradas(); track c.id) {
                <tr class="text-sm text-gray-300 hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-bold text-white">{{ c.usuario?.nombre }} {{ c.usuario?.apellidos }}</div>
                    <div class="text-xs text-gray-500">#{{ c.usuarioId }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-white">{{ c.servicio?.nombre }}</div>
                    <div class="text-xs text-gray-400">con {{ c.empleado?.nombre }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-white">{{ formatearFecha(c.fechaHora) }}</div>
                    <div class="text-xs font-bold" style="color:#d4af37">{{ formatearHora(c.fechaHora) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter"
                          [style]="estiloBadge(c.estado)">
                      {{ c.estado }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                      @if (c.estado === 'PENDIENTE') {
                        <button (click)="cambiarEstado(c.id, 'CONFIRMADA')"
                                class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                title="Confirmar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </button>
                      }
                      @if (c.estado !== 'CANCELADA' && c.estado !== 'COMPLETADA') {
                        <button (click)="cambiarEstado(c.id, 'COMPLETADA')"
                                class="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                title="Completar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                        </button>
                        <button (click)="cambiarEstado(c.id, 'CANCELADA')"
                                class="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                title="Cancelar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class CitasCrudComponent implements OnInit {
  private citasSvc = inject(CitasService);

  citas = signal<Cita[]>([]);
  cargando = signal(true);
  filtroActual = signal('TODAS');

  citasFiltradas = signal<Cita[]>([]);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.citasSvc.getAll().subscribe({
      next: (data) => {
        this.citas.set(data);
        this.aplicarFiltro();
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  filtrar(f: string) {
    this.filtroActual.set(f);
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    const f = this.filtroActual();
    if (f === 'TODAS') {
      this.citasFiltradas.set(this.citas());
    } else {
      this.citasFiltradas.set(this.citas().filter(c => c.estado === f));
    }
  }

  cambiarEstado(id: number, estado: EstadoCita) {
    this.citasSvc.updateEstado(id, estado).subscribe({
      next: () => this.cargar()
    });
  }

  formatearFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
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

  estiloFiltroActivo(f: string): string {
    const color = f === 'TODAS' ? '#d4af37' : this.colorEstado(f);
    return `background: ${color}20; color: ${color}; border-color: ${color}50; box-shadow: 0 0 15px ${color}10`;
  }

  estiloFiltroInactivo(): string {
    return `background: transparent; color: #4b5563; border-color: rgba(255,255,255,0.05)`;
  }
}
