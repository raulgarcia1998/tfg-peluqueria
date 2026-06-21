// CC-BY-SA 4.0 — TFG Peluquería

export type RolUsuario = 'ADMIN' | 'USER' | 'EMPLEADO';

export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: RolUsuario;
  createdAt: Date;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono: string;
}
