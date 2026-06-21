// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { User, RolUsuario } from '../../../core/models/user.model';

const ROL_BADGES: Record<RolUsuario, { text: string; css: string }> = {
  ADMIN:    { text: 'Admin',    css: 'bg-red-500/20 text-red-600 border border-red-500/30' },
  EMPLEADO: { text: 'Empleado', css: 'bg-accent/20 text-accent border border-accent/30' },
  USER:     { text: 'Cliente',  css: 'bg-blue-500/20 text-blue-600 border border-blue-500/30' },
};

@Component({
  selector: 'app-usuarios-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 md:p-8">

      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h2>
        <p class="text-gray-600">Administra roles y permisos de todos los usuarios registrados.</p>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-4 h-4"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            [(ngModel)]="filtroTexto"
            (ngModelChange)="cargar()"
            placeholder="Buscar por nombre, email o teléfono..."
            aria-label="Buscar usuarios"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900
                   placeholder-gray-500 focus:outline-none focus:border-accent/50 text-sm transition-colors"
          />
        </div>

        <select
          [(ngModel)]="filtroRol"
          (ngModelChange)="cargar()"
          aria-label="Filtrar por rol"
          class="px-4 py-2.5 rounded-xl border text-gray-900 text-sm
                 focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
          style="background:var(--bg-alt); border-color:var(--border-1)"
        >
          <option value="" style="background:var(--bg-alt); color:var(--text)">Todos los roles</option>
          <option value="ADMIN" style="background:var(--bg-alt); color:var(--text)">Admin</option>
          <option value="EMPLEADO" style="background:var(--bg-alt); color:var(--text)">Empleado</option>
          <option value="USER" style="background:var(--bg-alt); color:var(--text)">Cliente</option>
        </select>
      </div>

      <!-- Tabla / Lista -->
      @if (cargando()) {
        <div class="flex items-center justify-center py-20 text-gray-500" role="status" aria-live="polite">
          <svg class="animate-spin w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          <span>Cargando usuarios...</span>
        </div>
      } @else if (usuarios().length === 0) {
        <div class="text-center py-20 text-gray-500" role="status">
          <p>No se encontraron usuarios con los filtros aplicados.</p>
        </div>
      } @else {
        <div class="overflow-x-auto rounded-2xl border border-gray-200/8" role="region" aria-label="Lista de usuarios">
          <table class="w-full text-sm text-left">
            <thead>
              <tr class="text-gray-600 uppercase text-xs tracking-widest border-b border-gray-200/8"
                  style="background:var(--surface-1)">
                <th scope="col" class="px-4 py-3 font-semibold">Usuario</th>
                <th scope="col" class="px-4 py-3 font-semibold">Email</th>
                <th scope="col" class="px-4 py-3 font-semibold hidden md:table-cell">Teléfono</th>
                <th scope="col" class="px-4 py-3 font-semibold">Rol</th>
                <th scope="col" class="px-4 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (u of usuarios(); track u.id) {
                <tr class="border-b border-gray-200/5 transition-colors hover:bg-black/[0.06] cursor-pointer"
                    (click)="verPerfil(u.id)">
                  <!-- Nombre -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                           style="background:linear-gradient(135deg,var(--accent),var(--accent-2))"
                           aria-hidden="true">
                        {{ u.nombre[0] }}{{ u.apellidos[0] }}
                      </div>
                      <span class="text-gray-900 font-medium">{{ u.nombre }} {{ u.apellidos }}</span>
                    </div>
                  </td>
                  <!-- Email -->
                  <td class="px-4 py-3 text-gray-700">{{ u.email }}</td>
                  <!-- Teléfono -->
                  <td class="px-4 py-3 text-gray-600 hidden md:table-cell">{{ u.telefono || '—' }}</td>
                  <!-- Rol badge -->
                  <td class="px-4 py-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                          [ngClass]="rolBadge(u.rol).css">
                      {{ rolBadge(u.rol).text }}
                    </span>
                  </td>
                  <!-- Acciones -->
                  <td class="px-4 py-3 text-center" (click)="$event.stopPropagation()">
                    @if (editandoId() === u.id) {
                      <div class="flex items-center justify-center gap-2">
                        <select
                          [(ngModel)]="nuevoRol"
                          [attr.aria-label]="'Nuevo rol para ' + u.nombre"
                          class="px-2 py-1 rounded-lg border text-gray-900 text-xs
                                 focus:outline-none focus:border-accent/50"
                          style="background:var(--bg-alt); border-color:rgba(255,255,255,0.2); color:var(--text)"
                        >
                          <option value="USER" style="background:var(--bg-alt); color:var(--text)">Cliente</option>
                          <option value="EMPLEADO" style="background:var(--bg-alt); color:var(--text)">Empleado</option>
                          <option value="ADMIN" style="background:var(--bg-alt); color:var(--text)">Admin</option>
                        </select>
                        <button
                          (click)="guardarRol(u)"
                          [disabled]="guardando()"
                          class="px-3 py-1 rounded-lg bg-accent text-white font-bold text-xs
                                 hover:bg-accent2 disabled:opacity-50 transition-colors"
                          [attr.aria-label]="'Guardar rol para ' + u.nombre">
                          {{ guardando() ? '...' : 'OK' }}
                        </button>
                        <button
                          (click)="cancelarEdicion()"
                          class="px-3 py-1 rounded-lg bg-black/10 text-gray-700 text-xs hover:bg-black/20 transition-colors"
                          aria-label="Cancelar edición">
                          ✕
                        </button>
                      </div>
                    } @else {
                      <button
                        (click)="iniciarEdicion(u)"
                        class="px-3 py-1.5 rounded-lg border border-gray-200/10 text-gray-600 text-xs
                               hover:bg-black/5 hover:text-gray-900 transition-colors"
                        [attr.aria-label]="'Cambiar rol de ' + u.nombre + ' ' + u.apellidos">
                        Cambiar rol
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <p class="text-gray-500 text-xs mt-3 text-right" aria-live="polite">
          {{ usuarios().length }} usuario{{ usuarios().length === 1 ? '' : 's' }} encontrado{{ usuarios().length === 1 ? '' : 's' }}
        </p>
      }

      <!-- Toast de éxito/error -->
      @if (mensaje()) {
        <div class="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all"
             [ngClass]="mensajeError() ? 'bg-red-500 text-white' : 'bg-accent text-white'"
             role="alert" aria-live="assertive">
          {{ mensaje() }}
        </div>
      }
    </div>
  `
})
export class UsuariosCrudComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private router          = inject(Router);

  usuarios   = signal<User[]>([]);
  cargando   = signal(true);
  guardando  = signal(false);
  editandoId = signal<number | null>(null);
  nuevoRol: RolUsuario = 'USER';
  filtroTexto = '';
  filtroRol: RolUsuario | '' = '';
  mensaje    = signal('');
  mensajeError = signal(false);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.usuariosService.buscarTodos(
      this.filtroTexto || undefined,
      this.filtroRol || undefined
    ).subscribe({
      next: data => { this.usuarios.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  verPerfil(id: number) {
    this.router.navigate(['/admin/perfil', id]);
  }

  rolBadge(rol: RolUsuario) {
    return ROL_BADGES[rol] ?? ROL_BADGES.USER;
  }

  iniciarEdicion(u: User) {
    this.editandoId.set(u.id);
    this.nuevoRol = u.rol;
  }

  cancelarEdicion() {
    this.editandoId.set(null);
  }

  guardarRol(u: User) {
    if (this.nuevoRol === u.rol) { this.cancelarEdicion(); return; }

    this.guardando.set(true);
    this.usuariosService.actualizarRol(u.id, this.nuevoRol).subscribe({
      next: updated => {
        this.usuarios.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.editandoId.set(null);
        this.guardando.set(false);
        this.mostrarMensaje(`Rol de ${u.nombre} actualizado a ${this.nuevoRol}`);
      },
      error: () => {
        this.guardando.set(false);
        this.mostrarMensaje('Error al actualizar el rol', true);
      }
    });
  }

  private mostrarMensaje(texto: string, error = false) {
    this.mensaje.set(texto);
    this.mensajeError.set(error);
    setTimeout(() => this.mensaje.set(''), 3000);
  }
}
