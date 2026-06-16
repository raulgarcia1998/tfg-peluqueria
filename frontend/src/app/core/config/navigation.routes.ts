// CC-BY-SA 4.0 — TFG Peluquería
// Configuración centralizada de navegación
// Define todas las rutas disponibles con sus labels, iconos y roles requeridos

export type UserRole = 'ADMIN' | 'EMPLEADO' | 'USER' | 'PUBLIC';
export type IconType = 'home' | 'calendar' | 'clock' | 'star' | 'users' | 'edit' | 'phone';

export interface NavigationRoute {
  path: string;
  label: string;
  iconType: IconType;
  roles: UserRole[];
  section?: string;
}

/**
 * RUTAS DE USUARIO (visible en Dashboard de Usuario)
 * - Requiere autenticación como USER
 */
export const USER_ROUTES: NavigationRoute[] = [
  {
    path: '/user/dashboard',
    label: 'Inicio',
    iconType: 'home',
    roles: ['USER'],
    section: 'Navegación'
  },
  {
    path: '/user/reservar',
    label: 'Reservar cita',
    iconType: 'calendar',
    roles: ['USER'],
    section: 'Navegación'
  },
  {
    path: '/user/mis-citas',
    label: 'Mis citas',
    iconType: 'edit',
    roles: ['USER'],
    section: 'Navegación'
  }
];

/**
 * RUTAS DE ADMIN (visible en Dashboard de Admin)
 * - Requiere autenticación como ADMIN
 */
export const ADMIN_ROUTES: NavigationRoute[] = [
  {
    path: '/admin/dashboard',
    label: 'Inicio',
    iconType: 'home',
    roles: ['ADMIN'],
    section: 'Principal'
  },
  {
    path: '/admin/agenda-semanal',
    label: 'Agenda Rápida',
    iconType: 'phone',
    roles: ['ADMIN', 'EMPLEADO'],
    section: 'Gestión'
  },
  {
    path: '/admin/citas',
    label: 'Agenda y Citas',
    iconType: 'calendar',
    roles: ['ADMIN'],
    section: 'Gestión'
  },
  {
    path: '/admin/horario',
    label: 'Config. Horarios',
    iconType: 'clock',
    roles: ['ADMIN'],
    section: 'Gestión'
  },
  {
    path: '/admin/servicios',
    label: 'Servicios',
    iconType: 'star',
    roles: ['ADMIN'],
    section: 'Negocio'
  },
  {
    path: '/admin/empleados',
    label: 'Equipo',
    iconType: 'users',
    roles: ['ADMIN'],
    section: 'Negocio'
  }
];

/**
 * RUTAS EN HEADER (visible globalmente)
 * - Visible según autenticación
 */
export const HEADER_ROUTES: NavigationRoute[] = [
  {
    path: '/reservar',
    label: 'Reservar',
    iconType: 'calendar',
    roles: ['PUBLIC', 'USER', 'ADMIN']
  },
  {
    path: '/user/mis-citas',
    label: 'Mis Citas',
    iconType: 'calendar',
    roles: ['USER', 'ADMIN']
  },
  {
    path: '/admin/dashboard',
    label: 'Admin',
    iconType: 'home',
    roles: ['ADMIN']
  },
  {
    path: '/admin/servicios',
    label: 'Servicios',
    iconType: 'star',
    roles: ['ADMIN']
  },
  {
    path: '/admin/citas',
    label: 'Agenda',
    iconType: 'calendar',
    roles: ['ADMIN']
  },
  {
    path: '/admin/empleados',
    label: 'Equipo',
    iconType: 'users',
    roles: ['ADMIN']
  }
];
