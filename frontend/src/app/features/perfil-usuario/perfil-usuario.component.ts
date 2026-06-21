// CC-BY-SA 4.0 — TFG Peluquería
// Vista de perfil de usuario: accesible por el propio cliente y por el admin.
// El admin ve además el número de ausencias (no-shows) acumuladas.

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { CitasService } from '../../core/services/citas.service';
import { User, RolUsuario } from '../../core/models/user.model';
import { Cita, EstadisticasEmpleado } from '../../core/models/cita.model';

type Periodo = 'dia' | 'mes' | 'anio';

const ROL_LABEL: Record<RolUsuario, string> = {
  ADMIN: 'Administrador',
  EMPLEADO: 'Empleado',
  USER: 'Cliente',
};

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-6 md:p-10">
      <div class="max-w-3xl mx-auto">

        <!-- Volver (solo cuando el admin consulta a otro usuario) -->
        @if (!esPropio() && esAdmin()) {
          <a routerLink="/admin/citas"
             class="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Volver a Agenda y Citas
          </a>
        }

        @if (cargando()) {
          <div class="flex items-center justify-center py-24 text-gray-500">
            <svg class="animate-spin w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            <span class="text-lg">Cargando perfil...</span>
          </div>
        } @else if (!usuario()) {
          <div class="py-24 text-center text-gray-500 bg-black/5 rounded-3xl border border-gray-200/10">
            No se ha podido cargar el perfil solicitado.
          </div>
        } @else {
          <!-- Cabecera del perfil -->
          <div class="rounded-3xl p-8 mb-6 shadow-2xl"
               style="background:var(--surface-1);border:1px solid var(--surface-2)">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-surface shrink-0"
                   style="background:linear-gradient(135deg,var(--accent),var(--accent-2))">
                {{ iniciales() }}
              </div>
              <div class="min-w-0">
                <h1 class="text-3xl font-bold text-gray-900 truncate">{{ usuario()!.nombre }} {{ usuario()!.apellidos }}</h1>
                <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                      style="background:var(--accent-soft);border:1px solid var(--accent-border);color:var(--accent)">
                  {{ rolLabel(usuario()!.rol) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Datos de contacto -->
          <div class="rounded-3xl p-8 mb-6 shadow-2xl"
               style="background:var(--surface-1);border:1px solid var(--surface-2)">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-sm font-bold uppercase tracking-widest text-gray-900/40">Datos personales</h2>
              @if (puedeEditar() && !editando()) {
                <button (click)="abrirEdicion()"
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                        style="background:var(--accent-soft);border-color:var(--accent-border);color:var(--accent)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
              }
            </div>

            @if (!editando()) {
              <div class="grid sm:grid-cols-2 gap-5">
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre completo</p>
                  <p class="text-gray-900">{{ usuario()!.nombre }} {{ usuario()!.apellidos }}</p>
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Correo electrónico</p>
                  <p class="text-gray-900 break-all">{{ usuario()!.email }}</p>
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Teléfono</p>
                  @if (usuario()!.telefono) {
                    <a [href]="'tel:' + usuario()!.telefono" class="font-mono hover:underline" style="color:var(--accent)">{{ usuario()!.telefono }}</a>
                  } @else {
                    <p class="text-gray-600">No indicado</p>
                  }
                </div>
                @if (usuario()!.createdAt) {
                  <div>
                    <p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Registrado desde</p>
                    <p class="text-gray-900">{{ formatearFecha(usuario()!.createdAt) }}</p>
                  </div>
                }
              </div>
            } @else {
              <form [formGroup]="form" (ngSubmit)="guardar()" class="grid sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Nombre</label>
                  <input formControlName="nombre" type="text"
                         class="w-full px-4 py-2.5 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-accent/50 text-sm transition-colors"/>
                  @if (campoInvalido('nombre')) {
                    <p class="text-xs text-red-600 mt-1">El nombre es obligatorio.</p>
                  }
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Apellidos</label>
                  <input formControlName="apellidos" type="text"
                         class="w-full px-4 py-2.5 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-accent/50 text-sm transition-colors"/>
                  @if (campoInvalido('apellidos')) {
                    <p class="text-xs text-red-600 mt-1">Los apellidos son obligatorios.</p>
                  }
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Correo electrónico</label>
                  <input formControlName="email" type="email"
                         class="w-full px-4 py-2.5 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-accent/50 text-sm transition-colors"/>
                  @if (campoInvalido('email')) {
                    <p class="text-xs text-red-600 mt-1">Introduce un correo válido.</p>
                  }
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Teléfono</label>
                  <input formControlName="telefono" type="tel"
                         class="w-full px-4 py-2.5 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-accent/50 text-sm transition-colors"/>
                  @if (campoInvalido('telefono')) {
                    <p class="text-xs text-red-600 mt-1">El teléfono no tiene un formato válido.</p>
                  }
                </div>

                @if (errorEdicion()) {
                  <p class="sm:col-span-2 text-sm text-red-600">{{ errorEdicion() }}</p>
                }

                <div class="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button type="button" (click)="cancelarEdicion()"
                          class="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 border border-gray-200/10 hover:bg-black/5 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" [disabled]="form.invalid || guardando()"
                          class="px-5 py-2.5 rounded-xl text-sm font-bold text-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style="background:linear-gradient(135deg,var(--accent),var(--accent-2))">
                    {{ guardando() ? 'Guardando...' : 'Guardar cambios' }}
                  </button>
                </div>
              </form>
            }
          </div>

          <!-- Panel de rendimiento (solo staff) -->
          @if (mostrarStats()) {
            <div class="rounded-3xl p-8 mb-6 shadow-2xl"
                 style="background:var(--surface-1);border:1px solid var(--surface-2)">

              <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 class="text-sm font-bold uppercase tracking-widest text-gray-900/40">Rendimiento</h2>
                <!-- Selector Día / Mes / Año -->
                <div class="flex rounded-xl overflow-hidden border border-gray-200/10">
                  @for (p of periodos; track p.valor) {
                    <button (click)="cambiarPeriodo(p.valor)"
                            class="px-4 py-2 text-xs font-bold transition-colors"
                            [style]="periodo() === p.valor ? estiloPeriodoActivo() : estiloPeriodoInactivo()">
                      {{ p.label }}
                    </button>
                  }
                </div>
              </div>

              <!-- Navegación entre periodos -->
              <div class="flex items-center justify-center gap-3 mb-6">
                <button (click)="navegar(-1)"
                        class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 border border-gray-200/10 hover:bg-black/5 hover:text-gray-900 transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span class="text-gray-900 font-semibold text-sm capitalize min-w-[170px] text-center">{{ etiquetaPeriodo() }}</span>
                <button (click)="navegar(1)" [disabled]="esFuturo()"
                        class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 border border-gray-200/10 hover:bg-black/5 hover:text-gray-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              @if (cargandoStats()) {
                <div class="flex items-center justify-center gap-3 text-gray-500 py-10">
                  <svg class="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  <span class="text-sm">Calculando estadísticas...</span>
                </div>
              } @else if (stats()) {
                <!-- KPIs -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div class="rounded-2xl p-5" style="background:var(--accent-soft);border:1px solid var(--accent-soft-2)">
                    <p class="text-3xl font-black" style="color:var(--accent)">{{ stats()!.cortesRealizados }}</p>
                    <p class="text-xs text-gray-600 mt-1">Cortes realizados</p>
                  </div>
                  <div class="rounded-2xl p-5" style="background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2)">
                    <p class="text-3xl font-black" style="color:#10b981">{{ stats()!.horasTrabajadas }}<span class="text-base font-bold"> h</span></p>
                    <p class="text-xs text-gray-600 mt-1">Horas trabajadas</p>
                  </div>
                  <div class="rounded-2xl p-5" style="background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2)">
                    <p class="text-3xl font-black" style="color:#3b82f6">{{ stats()!.horasHorarioLaboral }}<span class="text-base font-bold"> h</span></p>
                    <p class="text-xs text-gray-600 mt-1">Horas de horario laboral</p>
                  </div>
                  <div class="rounded-2xl p-5" style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2)">
                    <p class="text-3xl font-black" style="color:#a855f7">{{ formatearDinero(stats()!.dineroRecibido) }}<span class="text-base font-bold"> €</span></p>
                    <p class="text-xs text-gray-600 mt-1">Dinero recibido</p>
                  </div>
                </div>

                <!-- Ocupación -->
                @if (stats()!.horasHorarioLaboral > 0) {
                  <div class="mb-8">
                    <div class="flex justify-between items-baseline mb-2">
                      <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Ocupación del horario</span>
                      <span class="text-sm font-bold text-gray-900">{{ ocupacion() }}%</span>
                    </div>
                    <div class="h-2.5 rounded-full overflow-hidden" style="background:var(--surface-1)">
                      <div class="h-full rounded-full transition-all" [style.width.%]="ocupacion()"
                           style="background:linear-gradient(90deg,#10b981,#34d399)"></div>
                    </div>
                  </div>
                }

                <!-- Reparto por tipo de servicio -->
                <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Tipos de corte realizados</h3>
                @if (stats()!.porcentajesTipos.length === 0) {
                  <p class="text-gray-500 text-sm py-2">Sin cortes realizados en este periodo.</p>
                } @else {
                  <div class="space-y-3">
                    @for (t of stats()!.porcentajesTipos; track t.categoria) {
                      <div>
                        <div class="flex justify-between items-baseline mb-1.5">
                          <span class="text-sm text-gray-900 font-medium">{{ nombreCategoria(t.categoria) }}</span>
                          <span class="text-xs text-gray-600">{{ t.porcentaje }}% · {{ t.cantidad }}</span>
                        </div>
                        <div class="h-2.5 rounded-full overflow-hidden" style="background:var(--surface-1)">
                          <div class="h-full rounded-full transition-all"
                               [style.width.%]="t.porcentaje" [style.background]="colorCategoria(t.categoria)"></div>
                        </div>
                      </div>
                    }
                  </div>
                }
              } @else {
                <p class="text-gray-500 text-sm py-6 text-center">No se pudieron cargar las estadísticas.</p>
              }
            </div>
          }

          <!-- Ausencias (solo admin) -->
          @if (esAdmin() && noShows() > 0) {
            <div class="rounded-3xl p-6 mb-6 shadow-2xl"
                 style="background:rgba(251,146,60,.06);border:1px solid rgba(251,146,60,.25)">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shrink-0"
                     style="background:rgba(251,146,60,.15);color:#fb923c">
                  {{ noShows() }}
                </div>
                <div>
                  <p class="text-gray-900 font-semibold">
                    {{ noShows() === 1 ? '1 ausencia registrada' : noShows() + ' ausencias registradas' }}
                  </p>
                  <p class="text-xs text-gray-600">Citas a las que el cliente no acudió.</p>
                </div>
              </div>
            </div>
          }

          <!-- Historial de cortes (clientes) -->
          @if (!mostrarStats()) {
          <div class="rounded-3xl p-8 shadow-2xl"
               style="background:var(--surface-1);border:1px solid var(--surface-2)">
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-900/40 mb-5">Historial de cortes</h2>

            @if (cargandoHistorial()) {
              <div class="flex items-center gap-3 text-gray-500 py-4">
                <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                <span class="text-sm">Cargando historial...</span>
              </div>
            } @else if (historialVisible().length === 0) {
              <p class="text-gray-500 text-sm py-4">No hay citas registradas aún.</p>
            } @else {
              <div class="space-y-3">
                @for (c of historialVisible(); track c.id) {
                  <div class="flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors"
                       style="background:var(--surface-1);border:1px solid var(--surface-1)">
                    <!-- Icono estado -->
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                         [style]="estiloIconoEstado(c.estado)">
                      @if (c.estado === 'COMPLETADA') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      } @else if (c.estado === 'NO_SHOW') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      } @else if (c.estado === 'CANCELADA') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      } @else {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      }
                    </div>
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <p class="text-gray-900 font-medium text-sm truncate">
                        {{ c.servicio?.nombre ?? 'Servicio' }}
                      </p>
                      <p class="text-xs text-gray-500">
                        con {{ c.empleado?.nombre ?? '—' }} · {{ formatearFechaHora(c.fechaHora) }}
                      </p>
                    </div>
                    <!-- Badge estado -->
                    <span class="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter"
                          [style]="estiloBadgeEstado(c.estado)">
                      {{ etiquetaEstado(c.estado) }}
                    </span>
                  </div>
                }
              </div>
            }
          </div>
          }
        }
      </div>
    </div>
  `
})
export class PerfilUsuarioComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private auth        = inject(AuthService);
  private usuariosSvc = inject(UsuariosService);
  private citasSvc    = inject(CitasService);
  private fb          = inject(FormBuilder);

  // Edición de datos personales
  editando      = signal(false);
  guardando     = signal(false);
  errorEdicion  = signal('');
  form = this.fb.group({
    nombre:    ['', [Validators.required, Validators.minLength(1)]],
    apellidos: ['', [Validators.required, Validators.minLength(1)]],
    email:     ['', [Validators.required, Validators.email]],
    telefono:  ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)]],
  });

  usuario          = signal<User | null>(null);
  noShows          = signal(0);
  cargando         = signal(true);
  historial        = signal<Cita[]>([]);
  cargandoHistorial = signal(true);

  esAdmin  = this.auth.isAdmin;
  esPropio = signal(true);

  // Puede editar quien es dueño del perfil o un admin
  puedeEditar = computed(() => this.esPropio() || this.esAdmin());

  // Estadísticas de rendimiento (staff)
  private targetId: number | null = null;
  periodos = [
    { valor: 'dia'  as Periodo, label: 'Día' },
    { valor: 'mes'  as Periodo, label: 'Mes' },
    { valor: 'anio' as Periodo, label: 'Año' },
  ];
  periodo       = signal<Periodo>('mes');
  fechaRef      = signal(new Date());
  stats         = signal<EstadisticasEmpleado | null>(null);
  cargandoStats = signal(false);

  private CAT_LABEL: Record<string, string> = {
    CORTE: 'Corte', COLOR: 'Color', TRATAMIENTO: 'Tratamiento', BARBA: 'Barba', OTROS: 'Otros',
  };
  private CAT_COLOR: Record<string, string> = {
    CORTE: 'var(--accent)', COLOR: '#a855f7', TRATAMIENTO: '#10b981', BARBA: '#3b82f6', OTROS: 'var(--text-faint)',
  };

  // Mostrar panel de rendimiento solo a staff (y a quien puede consultarlo)
  mostrarStats = computed(() => {
    const u = this.usuario();
    if (!u) return false;
    const staff = u.rol === 'ADMIN' || u.rol === 'EMPLEADO';
    return staff && (this.esAdmin() || this.esPropio());
  });

  ocupacion = computed(() => {
    const s = this.stats();
    if (!s || !s.horasHorarioLaboral) return 0;
    return Math.min(100, Math.round((s.horasTrabajadas / s.horasHorarioLaboral) * 100));
  });

  etiquetaPeriodo = computed(() => {
    const d = this.fechaRef();
    if (this.periodo() === 'dia')  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    if (this.periodo() === 'mes')  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return String(d.getFullYear());
  });

  esFuturo = computed(() => {
    const d = new Date(this.fechaRef());
    if (this.periodo() === 'dia')      d.setDate(d.getDate() + 1);
    else if (this.periodo() === 'mes') d.setMonth(d.getMonth() + 1);
    else                               d.setFullYear(d.getFullYear() + 1);
    return d > new Date();
  });

  // Cliente no ve NO_SHOW; admin ve todo
  historialVisible = computed(() => {
    const citas = this.historial();
    if (this.esAdmin()) return citas;
    return citas.filter(c => c.estado !== 'NO_SHOW');
  });

  iniciales = computed(() => {
    const u = this.usuario();
    if (!u) return '';
    return `${u.nombre?.[0] ?? ''}${u.apellidos?.[0] ?? ''}`.toUpperCase();
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const propioId = this.auth.currentUser()?.id;
      const paramId  = params.get('id');
      const targetId = paramId ? Number(paramId) : propioId;

      if (!targetId) {
        this.router.navigate(['/login']);
        return;
      }

      // Un usuario no-admin solo puede ver su propio perfil
      if (targetId !== propioId && !this.esAdmin()) {
        this.router.navigate(['/perfil']);
        return;
      }

      this.esPropio.set(targetId === propioId);
      this.cargarPerfil(targetId);
    });
  }

  private cargarPerfil(id: number): void {
    this.targetId = id;
    this.cargando.set(true);
    this.cargandoHistorial.set(true);

    this.usuariosSvc.obtenerPorId(id).subscribe({
      next: u => {
        this.usuario.set(u);
        this.cargando.set(false);
        if (this.mostrarStats()) this.cargarStats();
      },
      error: () => this.cargando.set(false)
    });

    // Historial: admin usa endpoint de admin; cliente usa sus propias citas
    const historial$ = this.esAdmin()
      ? this.citasSvc.getCitasDeUsuario(id)
      : this.citasSvc.getMisCitas();

    historial$.subscribe({
      next: citas => { this.historial.set(citas); this.cargandoHistorial.set(false); },
      error: () => this.cargandoHistorial.set(false)
    });

    if (this.esAdmin()) {
      this.citasSvc.contarNoShows(id).subscribe({
        next: r => this.noShows.set(r.noShows),
        error: () => this.noShows.set(0)
      });
    }
  }

  // ── Estadísticas ──────────────────────────────────────────────────────────

  cambiarPeriodo(p: Periodo): void {
    if (this.periodo() === p) return;
    this.periodo.set(p);
    this.cargarStats();
  }

  navegar(dir: number): void {
    const d = new Date(this.fechaRef());
    if (this.periodo() === 'dia')      d.setDate(d.getDate() + dir);
    else if (this.periodo() === 'mes') d.setMonth(d.getMonth() + dir);
    else                               d.setFullYear(d.getFullYear() + dir);
    this.fechaRef.set(d);
    this.cargarStats();
  }

  private rango(): { desde: string; hasta: string } {
    // Las citas se almacenan con la hora "de pared" en UTC (T..:..:..Z), por lo que
    // los límites del rango se construyen también en UTC para que coincidan exactamente
    // y no se pierdan citas en las fronteras de día/mes por el desfase horario local.
    const d = this.fechaRef();
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    let inicio: Date, fin: Date;
    if (this.periodo() === 'dia') {
      inicio = new Date(Date.UTC(y, m, day, 0, 0, 0));
      fin    = new Date(Date.UTC(y, m, day, 23, 59, 59, 999));
    } else if (this.periodo() === 'mes') {
      inicio = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      fin    = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
    } else {
      inicio = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
      fin    = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
    }
    return { desde: inicio.toISOString(), hasta: fin.toISOString() };
  }

  private cargarStats(): void {
    if (!this.targetId) return;
    this.cargandoStats.set(true);
    const { desde, hasta } = this.rango();
    this.citasSvc.getEstadisticasEmpleado(this.targetId, desde, hasta).subscribe({
      next: s => { this.stats.set(s); this.cargandoStats.set(false); },
      error: () => { this.stats.set(null); this.cargandoStats.set(false); },
    });
  }

  estiloPeriodoActivo(): string {
    return 'background:var(--accent);color:var(--bg)';
  }
  estiloPeriodoInactivo(): string {
    return 'background:transparent;color:var(--text-muted)';
  }

  nombreCategoria(c: string): string {
    return this.CAT_LABEL[c] ?? c;
  }
  colorCategoria(c: string): string {
    return this.CAT_COLOR[c] ?? 'var(--text-faint)';
  }

  formatearDinero(v: number): string {
    return v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ── Edición de datos personales ───────────────────────────────────────────

  abrirEdicion(): void {
    const u = this.usuario();
    if (!u) return;
    this.errorEdicion.set('');
    this.form.reset({
      nombre:    u.nombre,
      apellidos: u.apellidos,
      email:     u.email,
      telefono:  u.telefono ?? '',
    });
    this.editando.set(true);
  }

  cancelarEdicion(): void {
    this.editando.set(false);
    this.errorEdicion.set('');
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  guardar(): void {
    if (this.form.invalid || !this.targetId) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorEdicion.set('');

    const v = this.form.getRawValue();
    const datos = {
      nombre:    v.nombre!.trim(),
      apellidos: v.apellidos!.trim(),
      email:     v.email!.trim(),
      telefono:  v.telefono!.trim(),
    };

    this.usuariosSvc.actualizarPerfil(this.targetId, datos).subscribe({
      next: actualizado => {
        this.usuario.set(actualizado);
        // Si es el usuario en sesión, refrescar cabecera/sidebar
        if (this.esPropio()) this.auth.updateCurrentUser(actualizado);
        this.guardando.set(false);
        this.editando.set(false);
      },
      error: err => {
        this.guardando.set(false);
        const msg = err?.error?.message;
        this.errorEdicion.set(
          Array.isArray(msg) ? msg.join(' ')
            : (msg ?? 'No se pudieron guardar los cambios. Inténtalo de nuevo.')
        );
      },
    });
  }

  rolLabel(rol: RolUsuario): string {
    return ROL_LABEL[rol] ?? 'Cliente';
  }

  formatearFecha(fecha: Date | string): string {
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatearFechaHora(iso: string): string {
    const d = new Date(iso);
    // Hora "de reloj" del salón (guardada en UTC): se muestra en esa misma zona.
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
      + ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  }

  private colorEstado(estado: string): string {
    switch (estado) {
      case 'COMPLETADA': return '#10b981';
      case 'NO_SHOW':    return '#fb923c';
      case 'CANCELADA':  return '#ef4444';
      case 'CONFIRMADA': return '#3b82f6';
      default:           return '#f59e0b';
    }
  }

  estiloIconoEstado(estado: string): string {
    const c = this.colorEstado(estado);
    return `background:${c}18;color:${c}`;
  }

  estiloBadgeEstado(estado: string): string {
    const c = this.colorEstado(estado);
    return `background:${c}15;border:1px solid ${c}30;color:${c}`;
  }

  etiquetaEstado(estado: string): string {
    const map: Record<string, string> = {
      COMPLETADA: 'Realizada',
      NO_SHOW:    'Ausencia',
      CANCELADA:  'Cancelada',
      CONFIRMADA: 'Confirmada',
      PENDIENTE:  'Pendiente',
    };
    return map[estado] ?? estado;
  }
}
