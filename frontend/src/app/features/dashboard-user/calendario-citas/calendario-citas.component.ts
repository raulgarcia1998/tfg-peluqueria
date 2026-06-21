// CC-BY-SA 4.0 — TFG Peluquería
// Usuario: calendario mensual de disponibilidad + reserva de citas

import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HorarioService } from '../../../core/services/horario.service';
import { CitasService } from '../../../core/services/citas.service';
import { AuthService } from '../../../core/services/auth.service';
import { ServiciosService } from '../../../core/services/servicios.service';
import { MesDisponibilidad, EstadoDia, SlotHorario, BloqueDisponibilidad } from '../../../core/models/horario.model';
import { Servicio } from '../../../core/models/servicio.model';

interface CeldaDia {
  fecha: string;
  dia: number;
  esHoy: boolean;
  esMesActual: boolean;
  estado: EstadoDia | null;
  nombreDia?: string;
}

@Component({
  selector: 'app-calendario-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario-citas.component.html'
})
export class CalendarioCitasComponent implements OnInit {
  private horarioSvc   = inject(HorarioService);
  private citasSvc     = inject(CitasService);
  private authSvc      = inject(AuthService);
  private serviciosSvc = inject(ServiciosService);
  private router       = inject(Router);

  isLoggedIn = this.authSvc.isAuthenticated;
  isAdmin    = this.authSvc.isAdmin;

  @ViewChild('serviciosSection') serviciosSection?: ElementRef<HTMLElement>;

  servicios = signal<Servicio[]>([]);
  serviciosSeleccionados = signal<Servicio[]>([]);
  resaltarServicios = signal(false);

  duracionTotal = computed(() => 
    this.serviciosSeleccionados().reduce((acc, s) => acc + s.duracionMin, 0)
  );

  precioTotal = computed(() => 
    this.serviciosSeleccionados().reduce((acc, s) => acc + Number(s.precio || 0), 0)
  );

  anio = signal(new Date().getFullYear());
  mes  = signal(new Date().getMonth()); // 0-indexed

  disponibilidad = signal<MesDisponibilidad>({});
  cargando       = signal(false);
  cargandoSlots  = signal(false);

  diaModal        = signal<string | null>(null);
  slots           = signal<SlotHorario[]>([]);
  bloques         = signal<BloqueDisponibilidad[]>([]);
  slotSeleccionado = signal<SlotHorario | null>(null);

  notasReserva = '';
  reservando   = signal(false);
  errReserva   = signal('');
  reservaOk    = signal(false);

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // ── Computed ──────────────────────────────────────────────────────────────

  tituloMes = computed(() =>
    new Date(this.anio(), this.mes(), 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  );

  fechaModalFmt = computed(() => {
    if (!this.diaModal()) return '';
    return new Date(this.diaModal()! + 'T00:00:00')
      .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  });

  celdas = computed((): CeldaDia[] => {
    const anio = this.anio(), mes = this.mes();
    const hoy  = new Date().toISOString().slice(0, 10);
    const disp = this.disponibilidad();

    const primerDia  = new Date(anio, mes, 1);
    const ultimoDia  = new Date(anio, mes + 1, 0).getDate();
    let offsetLunes  = primerDia.getDay() - 1;
    if (offsetLunes < 0) offsetLunes = 6;

    const cs: CeldaDia[] = [];
    const diasAnterior = new Date(anio, mes, 0).getDate();

    for (let i = offsetLunes - 1; i >= 0; i--) {
      const d = diasAnterior - i;
      cs.push({ fecha: '', dia: d, esHoy: false, esMesActual: false, estado: null });
    }

    for (let d = 1; d <= ultimoDia; d++) {
      const fecha = `${anio}-${String(mes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cs.push({ fecha, dia: d, esHoy: fecha === hoy, esMesActual: true, estado: disp[fecha] ?? null });
    }

    const restantes = (7 - (cs.length % 7)) % 7;
    for (let d = 1; d <= restantes; d++) {
      cs.push({ fecha: '', dia: d, esHoy: false, esMesActual: false, estado: null });
    }

    return cs;
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  
  ngOnInit(): void { 
    this.cargarMes(); 
    this.cargarServicios();
  }

  // ── Métodos ────────────────────────────────────────────────────────────────

  cargarServicios(): void {
    this.serviciosSvc.getAll().subscribe(s => {
      this.servicios.set(s);
    });
  }

  toggleServicio(s: Servicio): void {
    const seleccionados = this.serviciosSeleccionados();
    const index = seleccionados.findIndex(serv => serv.id === s.id);

    if (index === -1) {
      this.serviciosSeleccionados.set([...seleccionados, s]);
      this.resaltarServicios.set(false); // ya hay servicio: oculta el aviso
    } else {
      this.serviciosSeleccionados.set(seleccionados.filter(serv => serv.id !== s.id));
    }

    if (this.diaModal()) {
      this.cargarSlots(this.diaModal()!);
    }
  }

  estaSeleccionado(id: number): boolean {
    return this.serviciosSeleccionados().some(s => s.id === id);
  }

  cargarMes(): void {
    this.cargando.set(true);
    this.horarioSvc.getDiasDisponiblesMes(this.anio(), this.mes() + 1).subscribe(d => {
      this.disponibilidad.set(d);
      this.cargando.set(false);
    });
  }

  cambiarMes(delta: number): void {
    let m = this.mes() + delta;
    let a = this.anio();
    if (m < 0)  { m = 11; a--; }
    if (m > 11) { m = 0;  a++; }
    this.mes.set(m);
    this.anio.set(a);
    this.diaModal.set(null);
    this.cargarMes();
  }

  seleccionarDia(c: CeldaDia): void {
    if (!c.esMesActual || !c.estado || c.estado === 'cerrado' || this.esPasado(c.fecha)) return;
    // Sin servicio elegido no se puede reservar: sube la "cámara" a los servicios
    if (this.serviciosSeleccionados().length === 0) {
      this.irAServicios();
      return;
    }
    this.diaModal.set(c.fecha);
    this.slotSeleccionado.set(null);
    this.slots.set([]);
    this.bloques.set([]);
    this.cargarSlots(c.fecha);
  }

  /** Desplaza la vista hasta la sección de servicios, la resalta y muestra el aviso */
  irAServicios(): void {
    this.serviciosSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.resaltarServicios.set(true);
    setTimeout(() => this.resaltarServicios.set(false), 4000);
  }

  /** Desde el aviso del modal: cierra y lleva al usuario a elegir servicio */
  elegirServicio(): void {
    this.diaModal.set(null);
    setTimeout(() => this.irAServicios(), 80);
  }

  cargarSlots(fecha: string): void {
    const duracion = this.duracionTotal() || 30;
    this.cargandoSlots.set(true);
    this.horarioSvc.getDisponibilidadDia(fecha, duracion).subscribe(d => {
      this.slots.set(d.slots);
      this.bloques.set(d.bloques ?? []);
      this.cargandoSlots.set(false);
    });
  }

  seleccionarSlot(slot: SlotHorario): void {
    if (this.serviciosSeleccionados().length === 0) {
      this.errReserva.set('Debes seleccionar al menos un servicio primero');
      return;
    }
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/reservar' } });
      return;
    }
    this.slotSeleccionado.set(slot);
    this.errReserva.set('');
    this.reservaOk.set(false);
    this.notasReserva = '';
  }

  confirmarReserva(): void {
    const slot  = this.slotSeleccionado();
    const fecha = this.diaModal();
    const seleccionados = this.serviciosSeleccionados();
    if (!slot || !fecha || seleccionados.length === 0) return;
    this.reservando.set(true);
    this.errReserva.set('');

    const fechaHora = `${fecha}T${slot.hora}:00`;
    const nombresServicios = seleccionados.map(s => s.nombre).join(', ');
    const notaMulti = `Servicios: ${nombresServicios}. ${this.notasReserva}`;

    this.citasSvc.create({ 
      empleadoId: 1, 
      servicioId: seleccionados[0].id, // Usamos el primero como referencia principal
      fechaHora, 
      notas: notaMulti
    }).subscribe({
      next: () => {
        this.reservando.set(false);
        this.reservaOk.set(true);
        setTimeout(() => {
          this.slotSeleccionado.set(null);
          this.diaModal.set(null);
          // Limpia la selección para evitar confusiones en la siguiente reserva
          this.serviciosSeleccionados.set([]);
          this.notasReserva = '';
          this.cargarMes();
        }, 2000);
      },
      error: (err) => {
        this.reservando.set(false);
        this.errReserva.set(err?.error?.message ?? 'Error al reservar la cita.');
      }
    });
  }

  cerrarModal(e: MouseEvent): void { this.diaModal.set(null); }
  cerrarConfirm(e: MouseEvent): void { this.slotSeleccionado.set(null); }

  esPasado(fecha: string): boolean {
    return fecha < new Date().toISOString().slice(0, 10);
  }

  textoEstado(e: EstadoDia): string {
    return e === 'disponible' ? 'libre' : e === 'parcial' ? 'pocas' : e === 'lleno' ? 'lleno' : '';
  }

  colorEstado(e: EstadoDia, small = false): string {
    if (e === 'disponible') return '#34d399';
    if (e === 'parcial')    return '#f59e0b';
    if (e === 'lleno')      return '#f87171';
    return 'var(--text-faint)';
  }

  estilocelda(c: CeldaDia): string {
    const sel = this.diaModal() === c.fecha;
    if (!c.esMesActual)
      return 'background:var(--surface-1);border:1px solid transparent;cursor:default;opacity:.2';
    if (this.esPasado(c.fecha) || !c.estado || c.estado === 'cerrado')
      return 'background:rgba(239,68,68,.13);border:1px solid rgba(239,68,68,.35);color:var(--text-faint);cursor:default';

    if (sel) return 'background:var(--accent);border:1px solid var(--accent-2);color:var(--bg-alt)';

    if (c.estado === 'disponible')
      return 'background:rgba(16,185,129,.22);border:1px solid rgba(16,185,129,.65);color:#6ee7b7';
    if (c.estado === 'parcial')
      return 'background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.5);color:var(--accent-2)';
    if (c.estado === 'lleno')
      return 'background:rgba(239,68,68,.20);border:1px solid rgba(239,68,68,.55);color:#f87171;cursor:default';
    return 'background:var(--surface-1);border:1px solid var(--surface-2);color:var(--text-muted)';
  }

  estiloSlot(s: SlotHorario): string {
    if (!s.disponible)
      return 'background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);color:var(--text-muted);cursor:default';
    return 'background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.45);color:#10b981;cursor:pointer';
  }
}
