// CC-BY-SA 4.0 — TFG Peluquería

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_SHOW';

export interface Cita {
  id: number;
  usuarioId: number;
  empleadoId: number;
  servicioId: number;
  fechaHora: string;   // ISO 8601
  estado: EstadoCita;
  notas?: string;
  precioFinal: number;
  usuario?: { nombre: string; apellidos: string; telefono?: string };
  clienteInvitadoNombre?: string;
  clienteInvitadoTelefono?: string;
  empleado?: { nombre: string; especialidad: string };
  servicio?: { nombre: string; duracionMin: number };
  /** Nº de ausencias acumuladas del cliente (lo adjunta el backend en el listado de admin) */
  clienteNoShows?: number;
  createdAt: string;
}

export interface CreateCitaDto {
  empleadoId: number;
  servicioId: number;
  fechaHora: string;
  notas?: string;
  /** Uso interno Admin/Empleado: reservar para un cliente existente */
  usuarioId?: number;
  /** Uso interno Admin/Empleado: reservar para un cliente sin cuenta */
  clienteInvitadoNombre?: string;
  clienteInvitadoTelefono?: string;
  estado?: EstadoCita;
}

export interface CitaFilter {
  estado?: EstadoCita;
  fechaDesde?: string;
  fechaHasta?: string;
  servicioId?: number;
  search?: string;
}

export interface TipoCorteStat {
  categoria: string;
  cantidad: number;
  porcentaje: number;
}

export interface EstadisticasEmpleado {
  cortesRealizados: number;
  horasTrabajadas: number;
  horasHorarioLaboral: number;
  dineroRecibido: number;
  porcentajesTipos: TipoCorteStat[];
}
