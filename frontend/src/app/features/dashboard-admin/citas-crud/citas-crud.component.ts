// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CitasService } from '../../../core/services/citas.service';
import { Cita, EstadoCita } from '../../../core/models/cita.model';

@Component({
  selector: 'app-citas-crud',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Citas y Reservas</h2>
        <p class="text-gray-600">Control de todas las citas de la peluquería.</p>
      </div>

      <!-- Filtros rápidos (MOCK) -->
      <div class="flex flex-wrap gap-4 mb-8">
        @for (f of ['TODAS', 'PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_SHOW']; track f) {
          <button (click)="filtrar(f)"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-all border"
                  [style]="filtroActual() === f ? estiloFiltroActivo(f) : estiloFiltroInactivo()">
            {{ etiqueta(f) }}
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
        <div class="py-20 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
          No hay citas que coincidan con el filtro.
        </div>
      } @else {
        <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3.5">Cliente</th>
                <th class="px-6 py-3.5">Teléfono</th>
                <th class="px-6 py-3.5">Servicio</th>
                <th class="px-6 py-3.5">Fecha y Hora</th>
                <th class="px-6 py-3.5">Estado</th>
                <th class="px-6 py-3.5">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (c of citasFiltradas(); track c.id) {
                <tr class="text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    [class.bg-gray-50]="$even">
                  <td class="px-6 py-4">
                    @if (c.usuario) {
                      <a [routerLink]="['/admin/perfil', c.usuarioId]"
                         class="font-bold text-gray-900 hover:text-accent hover:underline transition-colors">
                        {{ c.usuario.nombre }} {{ c.usuario.apellidos }}
                      </a>
                      <div class="text-xs text-gray-500">#{{ c.usuarioId }}</div>
                      @if ((c.clienteNoShows ?? 0) > 2) {
                        <div class="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold"
                             style="background:rgba(234,88,12,.15);border:1px solid rgba(234,88,12,.5);color:#c2410c"
                             [title]="c.clienteNoShows + ' ausencias registradas'">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                          Posible absentismo
                        </div>
                      }
                    } @else {
                      <div class="font-bold text-gray-900">{{ c.clienteInvitadoNombre ?? '—' }}</div>
                      <div class="text-xs text-gray-500">Invitado</div>
                    }
                  </td>
                  <td class="px-6 py-4">
                    @if (telefonoCliente(c); as tel) {
                      <a [href]="'tel:' + tel" class="text-sm font-mono hover:underline" style="color:var(--accent)">{{ tel }}</a>
                    } @else {
                      <span class="text-xs text-gray-600">—</span>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-gray-900">{{ c.servicio?.nombre }}</div>
                    <div class="text-xs text-gray-600">con {{ c.empleado?.nombre }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-gray-900">{{ formatearFecha(c.fechaHora) }}</div>
                    <div class="text-xs font-bold" style="color:var(--accent)">{{ formatearHora(c.fechaHora) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter"
                          [style]="estiloBadge(c.estado)">
                      {{ etiqueta(c.estado) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-2">
                      @if (c.estado === 'PENDIENTE') {
                        <button (click)="cambiarEstado(c.id, 'CONFIRMADA')"
                                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:-translate-y-0.5"
                                style="background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.45);color:#047857">
                          Confirmar
                        </button>
                        <button (click)="cambiarEstado(c.id, 'CANCELADA')"
                                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:-translate-y-0.5"
                                style="background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.45);color:#b91c1c">
                          Cancelar
                        </button>
                      }
                      @if (c.estado === 'CONFIRMADA') {
                        <button (click)="cambiarEstado(c.id, 'COMPLETADA')"
                                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:-translate-y-0.5"
                                style="background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.45);color:#1d4ed8">
                          Completada
                        </button>
                        <button (click)="cambiarEstado(c.id, 'CANCELADA')"
                                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:-translate-y-0.5"
                                style="background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.45);color:#b91c1c">
                          Cancelar
                        </button>
                        <button (click)="cambiarEstado(c.id, 'PENDIENTE')"
                                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:-translate-y-0.5"
                                style="background:rgba(107,114,128,.12);border-color:rgba(107,114,128,.45);color:var(--text-secondary)">
                          ← Revertir
                        </button>
                      }
                      @if (c.estado === 'COMPLETADA') {
                        <button (click)="cambiarEstado(c.id, 'CONFIRMADA')"
                                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:-translate-y-0.5"
                                style="background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.45);color:#b45309">
                          ← Revertir
                        </button>
                      }
                      @if (c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA') {
                        <button (click)="cambiarEstado(c.id, 'NO_SHOW')"
                                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:-translate-y-0.5"
                                style="background:rgba(234,88,12,.12);border-color:rgba(234,88,12,.45);color:#c2410c">
                          Absentismo
                        </button>
                      }
                      @if (c.estado === 'CANCELADA' || c.estado === 'NO_SHOW') {
                        <button (click)="cambiarEstado(c.id, 'PENDIENTE')"
                                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:-translate-y-0.5"
                                style="background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.45);color:#b45309">
                          ← Revertir
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

  telefonoCliente(c: Cita): string | null {
    return c.usuario?.telefono ?? c.clienteInvitadoTelefono ?? null;
  }

  // Las horas se guardan como hora "de reloj" del salón en UTC; se muestran en
  // esa misma zona para que coincida la hora reservada con la mostrada.
  formatearFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  }

  formatearHora(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  }

  /** Etiqueta legible de cada estado/filtro (NO_SHOW → «Absentismo»). */
  private readonly ESTADO_LABEL: Record<string, string> = {
    TODAS:      'Todas',
    PENDIENTE:  'Pendiente',
    CONFIRMADA: 'Confirmada',
    COMPLETADA: 'Completada',
    CANCELADA:  'Cancelada',
    NO_SHOW:    'Absentismo',
  };

  etiqueta(key: string): string {
    return this.ESTADO_LABEL[key] ?? key;
  }

  // Tonos oscuros (familia -700) para máximo contraste sobre fondo blanco.
  colorEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':  return '#b45309'; // amber-700
      case 'CONFIRMADA': return '#047857'; // emerald-700
      case 'CANCELADA':  return '#b91c1c'; // red-700
      case 'COMPLETADA': return '#1d4ed8'; // blue-700
      case 'NO_SHOW':    return '#c2410c'; // orange-700
      default:           return 'var(--text-secondary)';
    }
  }

  estiloBadge(estado: string): string {
    const color = this.colorEstado(estado);
    return `background: ${color}1f; border: 1px solid ${color}66; color: ${color};`;
  }

  estiloFiltroActivo(f: string): string {
    const color = f === 'TODAS' ? 'var(--accent)' : this.colorEstado(f);
    return `background: ${color}1f; color: ${color}; border-color: ${color}80; box-shadow: 0 2px 10px ${color}1a`;
  }

  estiloFiltroInactivo(): string {
    return `background: var(--surface-1); color: var(--text-secondary); border-color: var(--border-1)`;
  }
}
