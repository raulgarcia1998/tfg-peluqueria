// CC-BY-SA 4.0 — TFG Peluquería

/** Un bloque horario dentro de una jornada (permite turnos partidos) */
export interface FranjaHoraria {
  id?: number;
  horaInicio: string;  // 'HH:mm'
  horaFin: string;     // 'HH:mm'
  orden: number;
}

export interface HorarioLaboral {
  id?: number;
  fecha: string;                // 'YYYY-MM-DD'
  /** @deprecated Sustituido por tiempoTransicionMin. Antiguo "paso entre citas". */
  duracionCorteMin?: number;
  tiempoTransicionMin: number;  // Buffer (min) reservado tras cada cita
  activo: boolean;
  franjas: FranjaHoraria[];     // Bloques del día (≥1 para jornada partida)
}

export interface SlotHorario {
  hora: string;          // 'HH:mm'
  disponible: boolean;
  citaId?: number;
  clienteNombre?: string;
}

/** Bloque con sus slots propios — respuesta del endpoint de disponibilidad */
export interface BloqueDisponibilidad {
  horaInicio: string;
  horaFin: string;
  slots: SlotHorario[];
}

export interface HorarioDisponibilidad {
  fecha: string;
  duracionConsultada?: number;
  bloques: BloqueDisponibilidad[];  // Nuevo: slots agrupados por franja
  slots: SlotHorario[];             // Mantenido: lista plana para retrocompatibilidad
}

export type EstadoDia = 'disponible' | 'parcial' | 'lleno' | 'cerrado';

export interface MesDisponibilidad {
  [fecha: string]: EstadoDia;
}
