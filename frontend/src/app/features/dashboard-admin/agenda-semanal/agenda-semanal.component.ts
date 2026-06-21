// CC-BY-SA 4.0 — TFG Peluquería
// Panel de agendamiento rápido semanal: pensado para crear citas al instante
// mientras se atiende una llamada telefónica, sin salir de una sola pantalla.

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../../core/services/horario.service';
import { ServiciosService } from '../../../core/services/servicios.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { CitasService } from '../../../core/services/citas.service';
import { AuthService } from '../../../core/services/auth.service';
import { AgendaSemanal, DiaAgenda, SlotAgenda } from '../../../core/models/agenda.model';
import { Servicio } from '../../../core/models/servicio.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-agenda-semanal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda-semanal.component.html'
})
export class AgendaSemanalComponent implements OnInit {
  private horarioSvc  = inject(HorarioService);
  private serviciosSvc = inject(ServiciosService);
  private usuariosSvc = inject(UsuariosService);
  private citasSvc    = inject(CitasService);
  private auth        = inject(AuthService);

  fechaInicio = signal<string>(this.lunesDeLaSemana(new Date()));
  agenda      = signal<AgendaSemanal | null>(null);
  servicios   = signal<Servicio[]>([]);
  cargando    = signal(true);

  rangoTexto = computed(() => {
    const a = this.agenda();
    if (!a) return '';
    return `${this.formatearFechaCorta(a.fechaInicio)} – ${this.formatearFechaCorta(a.fechaFin)}`;
  });

  // ── Modal de reserva rápida ──────────────────────────────────────────────
  modalAbierto = signal(false);
  diaSeleccionado  = signal<string>('');
  horaSeleccionada = signal<string>('');

  modoCliente = signal<'existente' | 'invitado'>('existente');
  busquedaCliente = signal('');
  clientesEncontrados = signal<User[]>([]);
  buscandoClientes = signal(false);
  clienteSeleccionado = signal<User | null>(null);

  clienteInvitadoNombre = signal('');
  clienteInvitadoTelefono = signal('');

  servicioSeleccionadoId = signal<number | null>(null);
  guardando = signal(false);
  errorModal = signal('');

  ngOnInit(): void {
    this.serviciosSvc.getAll().subscribe(s => this.servicios.set(s.filter(x => x.activo)));
    this.cargarAgenda();
  }

  // ── Navegación semanal ───────────────────────────────────────────────────

  cargarAgenda(): void {
    this.cargando.set(true);
    this.horarioSvc.getAgendaSemanal(this.fechaInicio()).subscribe({
      next: (data) => {
        this.agenda.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  semanaAnterior(): void {
    this.fechaInicio.set(this.sumarDias(this.fechaInicio(), -7));
    this.cargarAgenda();
  }

  semanaSiguiente(): void {
    this.fechaInicio.set(this.sumarDias(this.fechaInicio(), 7));
    this.cargarAgenda();
  }

  semanaActual(): void {
    this.fechaInicio.set(this.lunesDeLaSemana(new Date()));
    this.cargarAgenda();
  }

  // ── Modal ────────────────────────────────────────────────────────────────

  abrirModal(dia: DiaAgenda, slot: SlotAgenda): void {
    if (!slot.disponible) return;

    this.diaSeleccionado.set(dia.fecha);
    this.horaSeleccionada.set(slot.hora);
    this.modoCliente.set('existente');
    this.busquedaCliente.set('');
    this.clientesEncontrados.set([]);
    this.clienteSeleccionado.set(null);
    this.clienteInvitadoNombre.set('');
    this.clienteInvitadoTelefono.set('');
    this.servicioSeleccionadoId.set(this.servicios()[0]?.id ?? null);
    this.errorModal.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  onBuscarClienteInput(texto: string): void {
    this.busquedaCliente.set(texto);
    this.clienteSeleccionado.set(null);

    if (texto.trim().length < 2) {
      this.clientesEncontrados.set([]);
      return;
    }

    this.buscandoClientes.set(true);
    this.usuariosSvc.buscarClientes(texto).subscribe({
      next: (data) => {
        this.clientesEncontrados.set(data);
        this.buscandoClientes.set(false);
      },
      error: () => this.buscandoClientes.set(false)
    });
  }

  seleccionarCliente(u: User): void {
    this.clienteSeleccionado.set(u);
    this.busquedaCliente.set(`${u.nombre} ${u.apellidos}`);
    this.clientesEncontrados.set([]);
  }

  confirmarReserva(): void {
    const fecha = this.diaSeleccionado();
    const hora  = this.horaSeleccionada();
    const servicioId = this.servicioSeleccionadoId();
    const usuarioActual = this.auth.currentUser();

    if (!servicioId) {
      this.errorModal.set('Selecciona un servicio');
      return;
    }
    if (this.modoCliente() === 'existente' && !this.clienteSeleccionado()) {
      this.errorModal.set('Busca y selecciona un cliente, o cambia a "Cliente invitado"');
      return;
    }
    if (this.modoCliente() === 'invitado' && !this.clienteInvitadoNombre().trim()) {
      this.errorModal.set('Indica el nombre del cliente invitado');
      return;
    }
    if (!usuarioActual) {
      this.errorModal.set('Sesión no válida, vuelve a iniciar sesión');
      return;
    }

    this.guardando.set(true);
    this.errorModal.set('');

    const fechaHora = `${fecha}T${hora}:00.000Z`;

    this.citasSvc.create({
      empleadoId: usuarioActual.id,
      servicioId,
      fechaHora,
      estado: 'CONFIRMADA',
      ...(this.modoCliente() === 'existente'
        ? { usuarioId: this.clienteSeleccionado()!.id }
        : {
            clienteInvitadoNombre: this.clienteInvitadoNombre().trim(),
            clienteInvitadoTelefono: this.clienteInvitadoTelefono().trim() || undefined
          })
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarAgenda();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorModal.set(err?.error?.message ?? 'No se ha podido crear la cita');
      }
    });
  }

  // ── Helpers de fecha (semana en UTC, igual que el backend) ─────────────────

  private lunesDeLaSemana(fecha: Date): string {
    const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
    const diaSemana = d.getUTCDay(); // 0=domingo .. 6=sábado
    const offset = diaSemana === 0 ? -6 : 1 - diaSemana; // retrocede hasta el lunes
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  private sumarDias(fechaIso: string, dias: number): string {
    const d = new Date(`${fechaIso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + dias);
    return d.toISOString().slice(0, 10);
  }

  formatearFechaCorta(fechaIso: string): string {
    const d = new Date(`${fechaIso}T00:00:00Z`);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  }

  esHoy(fechaIso: string): boolean {
    return fechaIso === new Date().toISOString().slice(0, 10);
  }
}
