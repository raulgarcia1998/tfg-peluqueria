// CC-BY-SA 4.0 — TFG Peluquería
// Admin: gestión de horarios laborales con soporte de turnos partidos (múltiples franjas)

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../../core/services/horario.service';
import { HorarioLaboral, FranjaHoraria } from '../../../core/models/horario.model';

interface CalendarioDia {
  fecha: string;
  dia: number;
  esHoy: boolean;
  esMesActual: boolean;
  horario?: HorarioLaboral;
}

@Component({
  selector: 'app-horario-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen" style="background:#0f0f1a">

      <!-- Header -->
      <div class="px-6 py-6 border-b" style="border-color:rgba(255,255,255,.08)">
        <h2 class="text-2xl font-bold text-white">Gestión de Horarios</h2>
        <p class="text-gray-400 text-sm mt-1">Define tu jornada laboral con bloques y descansos</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-0 h-full">

        <!-- ── Calendario ─────────────────────────────── -->
        <div class="flex-1 p-6">

          <!-- Navegación de mes -->
          <div class="flex items-center justify-between mb-6">
            <button (click)="cambiarMes(-1)"
              class="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 transition-all hover:-translate-x-0.5"
              style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Anterior
            </button>
            <h3 class="text-xl font-bold text-white capitalize">{{ tituloMes() }}</h3>
            <button (click)="cambiarMes(1)"
              class="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 transition-all hover:translate-x-0.5"
              style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)">
              Siguiente
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <!-- Encabezados semana -->
          <div class="grid grid-cols-7 mb-2">
            @for (d of ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']; track d) {
              <div class="text-center text-xs font-semibold py-2"
                   [style.color]="d === 'Dom' ? '#ef4444' : '#6b7280'">{{ d }}</div>
            }
          </div>

          <!-- Celdas del mes -->
          <div class="grid grid-cols-7 gap-1.5">
            @for (celda of celdasCalendario(); track celda.fecha) {
              <button
                (click)="seleccionarDia(celda)"
                [disabled]="!celda.esMesActual"
                class="aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden"
                [class.opacity-20]="!celda.esMesActual"
                [class.cursor-default]="!celda.esMesActual"
                [style]="estilocelda(celda)">

                <span [class.text-gray-900]="diaSeleccionado()?.fecha === celda.fecha && celda.horario"
                      [class.text-white]="diaSeleccionado()?.fecha !== celda.fecha || !celda.horario"
                      class="font-bold">
                  {{ celda.dia }}
                </span>

                <!-- Indicador de franjas -->
                @if (celda.horario && celda.esMesActual) {
                  <span class="text-[9px] mt-0.5 font-semibold leading-tight text-center px-1"
                        [class.text-gray-900]="diaSeleccionado()?.fecha === celda.fecha"
                        [class.text-emerald-400]="diaSeleccionado()?.fecha !== celda.fecha">
                    {{ etiquetaCelda(celda.horario) }}
                  </span>
                }

                <!-- Punto "hoy" -->
                @if (celda.esHoy) {
                  <span class="absolute bottom-1.5 w-1.5 h-1.5 rounded-full" style="background:#d4af37"></span>
                }
              </button>
            }
          </div>

          <!-- Leyenda -->
          <div class="flex flex-wrap items-center gap-5 mt-5 text-xs text-gray-500">
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded" style="background:rgba(16,185,129,.25);border:1px solid rgba(16,185,129,.5)"></span>
              Horario configurado
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded" style="background:rgba(16,185,129,.5)"></span>
              Día seleccionado
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded" style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)"></span>
              Sin horario
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full inline-block" style="background:#d4af37"></span>
              Hoy
            </span>
          </div>
        </div>

        <!-- ── Panel lateral: edición del día ──────────── -->
        <div class="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l p-6 flex flex-col gap-6"
             style="background:rgba(255,255,255,.02);border-color:rgba(255,255,255,.08)">

          @if (!diaSeleccionado()) {
            <!-- Estado vacío -->
            <div class="flex flex-col items-center justify-center h-64 text-center">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                   style="background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.2)">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p class="text-gray-300 font-medium">Selecciona un día</p>
              <p class="text-gray-500 text-sm mt-1">Haz clic en cualquier día del calendario para configurar su horario</p>
            </div>

          } @else {
            <!-- Encabezado panel -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-white capitalize">{{ fechaFormateada() }}</h3>
                @if (diaSeleccionado()?.horario) {
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                        style="background:rgba(16,185,129,.2);color:#10b981">● Configurado</span>
                } @else {
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                        style="background:rgba(107,114,128,.2);color:#9ca3af">Sin horario</span>
                }
              </div>
              <button (click)="diaSeleccionado.set(null)"
                class="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                style="background:rgba(255,255,255,.05)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Paso de cita -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">
                <svg class="inline w-4 h-4 mr-1 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="1.5">
                  <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                  <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
                </svg>
                Paso entre citas (min)
              </label>
              <div class="flex items-center gap-3">
                <input id="duracion-corte" type="number" [(ngModel)]="formDuracion"
                  min="5" max="120" step="5"
                  class="flex-1 px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12)">
                <span class="text-gray-400 text-sm whitespace-nowrap">min</span>
              </div>
              @if (slotsCalculados() > 0) {
                <p class="mt-1.5 text-xs text-gray-500">
                  → <span class="text-emerald-400 font-semibold">{{ slotsCalculados() }}</span> citas disponibles ese día
                </p>
              }
            </div>

            <!-- ── Franjas horarias ── -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-300">
                  <svg class="inline w-4 h-4 mr-1 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Bloques horarios
                </label>
                <button (click)="anadirFranja()"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                  style="background:rgba(212,175,55,.15);color:#d4af37;border:1px solid rgba(212,175,55,.3)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Añadir bloque
                </button>
              </div>

              @if (formFranjas.length === 0) {
                <div class="py-6 rounded-xl text-center text-gray-500 text-sm"
                     style="border:1px dashed rgba(255,255,255,.1)">
                  Sin bloques — haz clic en «Añadir bloque»
                </div>
              }

              @for (franja of formFranjas; track $index) {
                <div class="p-4 rounded-xl space-y-3 relative"
                     style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)">

                  <!-- Etiqueta bloque -->
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-widest"
                          style="color:#d4af37">Bloque {{ $index + 1 }}</span>
                    @if (formFranjas.length > 1) {
                      <button (click)="eliminarFranja($index)"
                        class="p-1 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                        style="background:rgba(239,68,68,.08)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    }
                  </div>

                  <!-- Inputs inicio / fin -->
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Inicio</label>
                      <input type="time" [(ngModel)]="franja.horaInicio"
                        class="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                        style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12)">
                    </div>
                    <div>
                      <label class="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Fin</label>
                      <input type="time" [(ngModel)]="franja.horaFin"
                        class="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
                        style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12)">
                    </div>
                  </div>

                  <!-- Resumen mini del bloque -->
                  @if (franja.horaInicio && franja.horaFin && franja.horaInicio < franja.horaFin) {
                    <p class="text-[10px] text-gray-500">
                      {{ minutosFranja(franja) }} min
                      · <span class="text-emerald-400">{{ slotsFranja(franja) }} citas</span>
                    </p>
                  }
                </div>
              }

              @if (formFranjas.length >= 2) {
                <!-- Resumen de descansos -->
                <div class="px-3 py-2 rounded-lg text-xs text-gray-500"
                     style="background:rgba(212,175,55,.05);border:1px solid rgba(212,175,55,.1)">
                  <span class="text-[#d4af37] font-bold">Descansos:</span>
                  @for (desc of resumenDescansos(); track $index) {
                    <span class="ml-2">{{ desc }}</span>
                  }
                </div>
              }
            </div>

            <!-- Error -->
            @if (errorForm()) {
              <p class="text-xs text-red-400 px-3 py-2 rounded-lg"
                 style="background:rgba(239,68,68,.1)">{{ errorForm() }}</p>
            }

            <!-- Acciones -->
            <div class="flex gap-3">
              <button id="btn-guardar-horario" (click)="guardar()"
                [disabled]="guardando()"
                class="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-900 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style="background:linear-gradient(135deg,#d4af37,#f0c952)">
                @if (guardando()) {
                  <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                } @else {
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
                Guardar
              </button>

              @if (diaSeleccionado()?.horario?.id) {
                <button id="btn-eliminar-horario" (click)="eliminar()"
                  [disabled]="guardando()"
                  class="px-4 py-3 rounded-xl text-sm font-semibold text-red-400 transition-all hover:text-red-300 disabled:opacity-50"
                  style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              }
            </div>

            <!-- Toast éxito -->
            @if (toastOk()) {
              <div class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-emerald-300"
                   style="background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                ¡Horario guardado correctamente!
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class HorarioAdminComponent implements OnInit {
  private horarioSvc = inject(HorarioService);

  anioActual  = signal(new Date().getFullYear());
  mesActual   = signal(new Date().getMonth()); // 0-indexed
  horariosMes = signal<HorarioLaboral[]>([]);

  diaSeleccionado = signal<CalendarioDia | null>(null);

  formDuracion = 30;
  formFranjas: { horaInicio: string; horaFin: string }[] = [
    { horaInicio: '09:00', horaFin: '14:00' }
  ];

  guardando = signal(false);
  errorForm = signal('');
  toastOk   = signal(false);

  // ── Computed ──────────────────────────────────────────────────────────────

  tituloMes = computed(() =>
    new Date(this.anioActual(), this.mesActual(), 1)
      .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  );

  fechaFormateada = computed(() => {
    const d = this.diaSeleccionado();
    if (!d) return '';
    return new Date(d.fecha + 'T00:00:00')
      .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  });

  slotsCalculados = computed(() => {
    if (!this.formFranjas.length || !this.formDuracion) return 0;
    return this.formFranjas.reduce((acc, f) => acc + this.slotsFranja(f), 0);
  });

  resumenDescansos = computed((): string[] => {
    const result: string[] = [];
    for (let i = 0; i < this.formFranjas.length - 1; i++) {
      const fin     = this.formFranjas[i].horaFin;
      const inicio  = this.formFranjas[i + 1].horaInicio;
      if (fin && inicio && fin < inicio) {
        result.push(`${fin}–${inicio}`);
      }
    }
    return result;
  });

  celdasCalendario = computed((): CalendarioDia[] => {
    const anio = this.anioActual();
    const mes  = this.mesActual();
    const hoy  = new Date().toISOString().slice(0, 10);
    const horarios = this.horariosMes();

    const primerDia  = new Date(anio, mes, 1);
    const ultimoDia  = new Date(anio, mes + 1, 0).getDate();
    let offsetLunes  = primerDia.getDay() - 1;
    if (offsetLunes < 0) offsetLunes = 6;

    const celdas: CalendarioDia[] = [];
    const diasMesAnterior = new Date(anio, mes, 0).getDate();

    for (let i = offsetLunes - 1; i >= 0; i--) {
      const d = diasMesAnterior - i;
      const f = `${anio}-${String(mes === 0 ? 12 : mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      celdas.push({ fecha: f, dia: d, esHoy: false, esMesActual: false });
    }

    for (let d = 1; d <= ultimoDia; d++) {
      const fecha   = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const horario = horarios.find(h => h.fecha === fecha);
      celdas.push({ fecha, dia: d, esHoy: fecha === hoy, esMesActual: true, horario });
    }

    const restantes = (7 - (celdas.length % 7)) % 7;
    for (let d = 1; d <= restantes; d++) {
      const f = `${anio}-${String(mes + 2 > 12 ? 1 : mes + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      celdas.push({ fecha: f, dia: d, esHoy: false, esMesActual: false });
    }

    return celdas;
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void { this.cargarMes(); }

  // ── Métodos ────────────────────────────────────────────────────────────────

  cargarMes(): void {
    this.horarioSvc.getHorariosMes(this.anioActual(), this.mesActual() + 1).subscribe(h => {
      this.horariosMes.set(h);
      const sel = this.diaSeleccionado();
      if (sel) {
        const actualizado = this.celdasCalendario().find(c => c.fecha === sel.fecha);
        if (actualizado) this.diaSeleccionado.set(actualizado);
      }
    });
  }

  cambiarMes(delta: number): void {
    let m = this.mesActual() + delta;
    let a = this.anioActual();
    if (m < 0)  { m = 11; a--; }
    if (m > 11) { m = 0;  a++; }
    this.mesActual.set(m);
    this.anioActual.set(a);
    this.diaSeleccionado.set(null);
    this.cargarMes();
  }

  seleccionarDia(celda: CalendarioDia): void {
    if (!celda.esMesActual) return;
    this.diaSeleccionado.set(celda);
    this.errorForm.set('');
    this.toastOk.set(false);

    if (celda.horario) {
      this.formDuracion = celda.horario.duracionCorteMin;
      // Cargar franjas existentes o crear una desde los campos legacy
      if (celda.horario.franjas?.length) {
        this.formFranjas = celda.horario.franjas.map(f => ({
          horaInicio: f.horaInicio,
          horaFin: f.horaFin,
        }));
      } else {
        this.formFranjas = [{ horaInicio: '09:00', horaFin: '19:00' }];
      }
    } else {
      this.formDuracion = 30;
      this.formFranjas  = [{ horaInicio: '09:00', horaFin: '14:00' }];
    }
  }

  anadirFranja(): void {
    // Sugiere inicio justo después del último bloque (1h de descanso por defecto)
    const ultima = this.formFranjas[this.formFranjas.length - 1];
    const sugerido = ultima?.horaFin
      ? this.sumarMinutos(ultima.horaFin, 60)
      : '15:00';
    const finSugerido = this.sumarMinutos(sugerido, 180); // 3h de bloque por defecto
    this.formFranjas = [...this.formFranjas, { horaInicio: sugerido, horaFin: finSugerido }];
  }

  eliminarFranja(idx: number): void {
    this.formFranjas = this.formFranjas.filter((_, i) => i !== idx);
  }

  guardar(): void {
    const dia = this.diaSeleccionado();
    if (!dia) return;

    // Validaciones
    if (this.formFranjas.length === 0) {
      this.errorForm.set('Añade al menos un bloque horario'); return;
    }
    for (const f of this.formFranjas) {
      if (!f.horaInicio || !f.horaFin) {
        this.errorForm.set('Completa las horas de inicio y fin de todos los bloques'); return;
      }
      if (f.horaInicio >= f.horaFin) {
        this.errorForm.set('El inicio de cada bloque debe ser anterior al fin'); return;
      }
    }
    if (this.formDuracion < 5) {
      this.errorForm.set('El paso mínimo entre citas es 5 minutos'); return;
    }

    // Validar que los bloques no se solapan entre sí
    const sorted = [...this.formFranjas].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].horaFin > sorted[i + 1].horaInicio) {
        this.errorForm.set(`El bloque ${i + 1} y el ${i + 2} se solapan`); return;
      }
    }

    this.guardando.set(true);
    this.errorForm.set('');

    const dto = {
      fecha: dia.fecha,
      duracionCorteMin: this.formDuracion,
      activo: true,
      franjas: this.formFranjas.map((f, i) => ({ ...f, orden: i })),
    };

    const obs$ = dia.horario?.id
      ? this.horarioSvc.actualizarHorario(dia.horario.id, dto as any)
      : this.horarioSvc.crearHorario(dto as any);

    obs$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toastOk.set(true);
        setTimeout(() => this.toastOk.set(false), 3000);
        this.cargarMes();
      },
      error: () => {
        this.guardando.set(false);
        this.errorForm.set('Error al guardar. Inténtalo de nuevo.');
      }
    });
  }

  eliminar(): void {
    const dia = this.diaSeleccionado();
    if (!dia?.horario?.id) return;
    if (!confirm('¿Eliminar el horario de este día?')) return;
    this.guardando.set(true);
    this.horarioSvc.eliminarHorario(dia.horario.id).subscribe({
      next: () => {
        this.guardando.set(false);
        this.diaSeleccionado.set(null);
        this.cargarMes();
      },
      error: () => {
        this.guardando.set(false);
        this.errorForm.set('Error al eliminar.');
      }
    });
  }

  // ── Helpers de cálculo ───────────────────────────────────────────────────

  minutosFranja(f: { horaInicio: string; horaFin: string }): number {
    if (!f.horaInicio || !f.horaFin) return 0;
    return this.toMinutes(f.horaFin) - this.toMinutes(f.horaInicio);
  }

  slotsFranja(f: { horaInicio: string; horaFin: string }): number {
    const mins = this.minutosFranja(f);
    return mins > 0 && this.formDuracion > 0 ? Math.floor(mins / this.formDuracion) : 0;
  }

  etiquetaCelda(horario: HorarioLaboral): string {
    if (horario.franjas?.length >= 2) {
      return `${horario.franjas[0].horaInicio} · ${horario.franjas.length} bloq.`;
    }
    if (horario.franjas?.length === 1) {
      return horario.franjas[0].horaInicio;
    }
    return '';
  }

  estilocelda(celda: CalendarioDia): string {
    const sel = this.diaSeleccionado()?.fecha === celda.fecha;
    if (!celda.esMesActual)
      return 'background:rgba(255,255,255,.02);border:1px solid transparent;cursor:default';
    if (sel && celda.horario)
      return 'background:rgba(16,185,129,.85);border:1px solid #10b981;color:#fff';
    if (sel)
      return 'background:#d4af37;border:1px solid #f0c952;color:#1a1a1a';
    if (celda.horario)
      return 'background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.4);color:#fff';
    if (celda.esHoy)
      return 'background:rgba(212,175,55,.15);border:1px solid rgba(212,175,55,.4);color:#fff';
    return 'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:#d1d5db';
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private sumarMinutos(time: string, mins: number): string {
    const total = this.toMinutes(time) + mins;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
