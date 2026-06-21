// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosService } from '../../../core/services/servicios.service';
import { Servicio, CategoriaServicio } from '../../../core/models/servicio.model';

@Component({
  selector: 'app-servicios-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Servicios</h2>
          <p class="text-gray-600">Gestiona el catálogo de servicios de la peluquería.</p>
        </div>
        <button (click)="abrirModal()"
                class="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                style="background:var(--accent)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Servicio
        </button>
      </div>

      @if (cargando()) {
        <div class="flex items-center justify-center py-20 text-gray-500">
          <svg class="animate-spin w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          <span class="text-lg">Cargando catálogo...</span>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (s of servicios(); track s.id) {
            <div class="p-6 rounded-2xl flex flex-col justify-between"
                 style="background:var(--surface-1); border:1px solid var(--surface-2)">
              <div>
                <div class="flex justify-between items-start mb-4">
                  <span class="text-xs font-bold px-2 py-1 rounded-lg"
                        [style]="estiloBadge(s.categoria)">
                    {{ s.categoria }}
                  </span>
                  <div class="flex gap-2">
                    <button (click)="abrirModal(s)" class="p-2 rounded-lg hover:bg-black/10 text-gray-600 hover:text-gray-900 transition-all">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                      </svg>
                    </button>
                    <button (click)="eliminar(s.id)" class="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-600 transition-all">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-1">{{ s.nombre }}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ s.descripcion || 'Sin descripción' }}</p>
              </div>
              
              <div class="flex items-center justify-between mt-4 pt-4 border-t" style="border-color:var(--surface-2)">
                <div class="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span class="text-gray-700 text-sm font-medium">{{ s.duracionMin }} min</span>
                </div>
                <span class="text-xl font-bold text-gray-900">{{ s.precio }}€</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal -->
      @if (mostrarModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             (click)="cerrarModal()">
          <div class="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
               style="background:var(--bg-alt); border:1px solid var(--border-1)"
               (click)="$event.stopPropagation()">
            
            <div class="px-8 py-6 border-b" style="border-color:var(--surface-2)">
              <h3 class="text-2xl font-bold text-gray-900">{{ editando() ? 'Editar' : 'Nuevo' }} Servicio</h3>
            </div>

            <div class="p-8 space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Nombre</label>
                <input type="text" [(ngModel)]="form.nombre" placeholder="Corte degradado"
                       class="w-full px-4 py-3 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900 outline-none focus:border-accent transition-all">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">Categoría</label>
                  <select [(ngModel)]="form.categoria"
                          class="w-full px-4 py-3 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900 outline-none focus:border-accent transition-all">
                    <option value="CORTE">Corte</option>
                    <option value="COLOR">Color</option>
                    <option value="TRATAMIENTO">Tratamiento</option>
                    <option value="BARBA">Barba</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">Precio (€)</label>
                  <input type="number" [(ngModel)]="form.precio"
                         class="w-full px-4 py-3 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900 outline-none focus:border-accent transition-all">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">Duración (min)</label>
                  <input type="number" [(ngModel)]="form.duracionMin"
                         class="w-full px-4 py-3 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900 outline-none focus:border-accent transition-all">
                </div>
                <div class="flex items-end pb-3">
                   <label class="flex items-center gap-3 cursor-pointer">
                     <input type="checkbox" [(ngModel)]="form.activo" class="w-5 h-5 accent-accent">
                     <span class="text-sm text-gray-700">Activo</span>
                   </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Descripción</label>
                <textarea [(ngModel)]="form.descripcion" rows="3"
                          class="w-full px-4 py-3 rounded-xl bg-black/5 border border-gray-200/10 text-gray-900 outline-none focus:border-accent transition-all resize-none"></textarea>
              </div>

              <div class="flex gap-4 pt-4">
                <button (click)="cerrarModal()"
                        class="flex-1 py-4 rounded-2xl font-bold text-gray-600 transition-all hover:text-gray-900"
                        style="background:var(--surface-1); border:1px solid rgba(255,255,255,0.08)">
                  Cancelar
                </button>
                <button (click)="guardar()"
                        class="flex-1 py-4 rounded-2xl font-bold text-white transition-all hover:scale-[1.02]"
                        style="background:var(--accent)">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ServiciosCrudComponent implements OnInit {
  private serviciosSvc = inject(ServiciosService);

  servicios = signal<Servicio[]>([]);
  cargando = signal(true);
  mostrarModal = signal(false);
  editando = signal(false);

  form = {
    id: 0,
    nombre: '',
    descripcion: '',
    precio: 20,
    duracionMin: 30,
    categoria: 'CORTE' as CategoriaServicio,
    activo: true
  };

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.serviciosSvc.getAll().subscribe({
      next: (data) => {
        this.servicios.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  abrirModal(s?: Servicio) {
    if (s) {
      this.editando.set(true);
      this.form = { 
        ...s,
        descripcion: s.descripcion ?? ''
      };
    } else {
      this.editando.set(false);
      this.form = { id: 0, nombre: '', descripcion: '', precio: 20, duracionMin: 30, categoria: 'CORTE', activo: true };
    }
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  guardar() {
    const { id, ...dto } = this.form;
    const obs$ = this.editando() 
      ? this.serviciosSvc.update(id, dto) 
      : this.serviciosSvc.create(dto);

    obs$.subscribe({
      next: () => {
        this.cargar();
        this.cerrarModal();
      }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Seguro que quieres eliminar este servicio?')) return;
    this.serviciosSvc.delete(id).subscribe({
      next: () => this.cargar()
    });
  }

  estiloBadge(cat: CategoriaServicio): string {
    const colors: Record<CategoriaServicio, string> = {
      CORTE: 'var(--accent)',
      COLOR: '#8b5cf6',
      TRATAMIENTO: '#10b981',
      BARBA: '#3b82f6',
      OTROS: 'var(--text-faint)'
    };
    const c = colors[cat] || 'var(--text-faint)';
    return `background: ${c}20; color: ${c}; border: 1px solid ${c}40`;
  }
}
