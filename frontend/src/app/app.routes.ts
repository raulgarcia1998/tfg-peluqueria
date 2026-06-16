// CC-BY-SA 4.0 — TFG Peluquería

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'reservar',
    loadComponent: () =>
      import('./features/dashboard-user/calendario-citas/calendario-citas.component').then(
        m => m.CalendarioCitasComponent
      )
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard-user/dashboard-user.component').then(m => m.DashboardUserComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard-user/user-home/user-home.component').then(m => m.UserHomeComponent)
      },
      {
        path: 'reservar',
        redirectTo: '/reservar',
        pathMatch: 'full'
      },
      {
        path: 'mis-citas',
        loadComponent: () =>
          import('./features/dashboard-user/mis-citas/mis-citas.component').then(
            m => m.MisCitasComponent
          )
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard-admin/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
      },
      {
        path: 'horario',
        loadComponent: () =>
          import('./features/dashboard-admin/horario/horario-admin.component').then(
            m => m.HorarioAdminComponent
          )
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./features/dashboard-admin/citas-crud/citas-crud.component').then(
            m => m.CitasCrudComponent
          )
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./features/dashboard-admin/servicios-crud/servicios-crud.component').then(
            m => m.ServiciosCrudComponent
          )
      },
      {
        path: 'empleados',
        loadComponent: () =>
          import('./features/dashboard-admin/empleados-crud/empleados-crud.component').then(
            m => m.EmpleadosCrudComponent
          )
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'acceso-denegado',
    loadComponent: () =>
      import('./shared/components/access-denied/access-denied.component').then(
        m => m.AccessDeniedComponent
      )
  },
  { path: '', redirectTo: 'reservar', pathMatch: 'full' },
  { path: '**', redirectTo: 'reservar' }
];
