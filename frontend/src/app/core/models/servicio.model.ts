// CC-BY-SA 4.0 — TFG Peluquería

export type CategoriaServicio = 'CORTE' | 'COLOR' | 'TRATAMIENTO' | 'BARBA' | 'OTROS';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMin: number;
  categoria: CategoriaServicio;
  fotoUrl?: string;
  activo: boolean;
}
