// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-empleados-crud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-white mb-2">Empleados</h2>
          <p class="text-gray-400">Gestiona el equipo de profesionales de la peluquería.</p>
        </div>
      </div>

      @if (cargando()) {
        <div class="flex items-center justify-center py-20 text-gray-500">
          <svg class="animate-spin w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          <span class="text-lg">Cargando equipo...</span>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (e of empleados(); track e.id) {
            <div class="p-6 rounded-3xl relative overflow-hidden group transition-all hover:-translate-y-1"
                 style="background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08)">
              
              <!-- Avatar Circle -->
              <div class="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform"
                   style="background:linear-gradient(135deg, #d4af37, #f0c952)">
                {{ e.nombre[0] }}{{ e.apellidos[0] }}
              </div>

              <div class="text-center">
                <h3 class="text-xl font-bold text-white mb-1">{{ e.nombre }} {{ e.apellidos }}</h3>
                <p class="text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-4">
                  {{ e.rol.nombre }}
                </p>
                
                <div class="space-y-2 mb-6">
                  <div class="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {{ e.email }}
                  </div>
                </div>

                <button class="w-full py-3 rounded-xl text-xs font-bold text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all">
                  Ver Perfil Completo
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class EmpleadosCrudComponent implements OnInit {
  private http = inject(HttpClient);

  empleados = signal<User[]>([]);
  cargando = signal(true);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    // Filtrar usuarios con rol EMPLEADO o ADMIN para la lista de equipo
    this.http.get<User[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (data) => {
        this.empleados.set(data.filter(u => u.rol.nombre !== 'USER'));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
