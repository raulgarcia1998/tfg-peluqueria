// CC-BY-SA 4.0 — TFG Peluquería

import { EstadoCita } from './cita.model';

export interface CitaResumenSlot {
  id: number;
  cliente: string;
  telefono?: string | null;
  servicio?: string | null;
  estado: EstadoCita;
}

export interface SlotAgenda {
  hora: string;
  disponible: boolean;
  cita?: CitaResumenSlot | null;
}

export interface DiaAgenda {
  fecha: string;
  diaSemana: string;
  activo: boolean;
  slots: SlotAgenda[];
}

export interface AgendaSemanal {
  fechaInicio: string;
  fechaFin: string;
  dias: DiaAgenda[];
}
