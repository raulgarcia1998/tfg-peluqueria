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
}

export interface CitaFilter {
  estado?: EstadoCita;
  fechaDesde?: string;
  fechaHasta?: string;
  servicioId?: number;
  search?: string;
}
