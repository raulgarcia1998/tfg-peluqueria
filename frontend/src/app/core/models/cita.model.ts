// CC-BY-SA 4.0 — TFG Peluquería

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

export interface Cita {
  id: number;
  usuarioId: number;
  empleadoId: number;
  servicioId: number;
  fechaHora: string;   // ISO 8601
  estado: EstadoCita;
  notas?: string;
  precioFinal: number;
  usuario?: { nombre: string; apellidos: string };
  empleado?: { nombre: string; especialidad: string };
  servicio?: { nombre: string; duracionMin: number };
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
