// CC-BY-SA 4.0 — TFG Peluquería
// Página de inicio del panel admin

import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CitasService } from '../../../core/services/citas.service';
import { ServiciosService } from '../../../core/services/servicios.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-home.component.html'
})
export class AdminHomeComponent implements OnInit {
  private citasService = inject(CitasService);
  private serviciosService = inject(ServiciosService);

  citasHoy = signal<number | null>(null);
  totalServicios = signal<number | null>(null);

  ngOnInit(): void {
    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    this.citasService
      .getAll({ fechaDesde: `${hoy}T00:00:00`, fechaHasta: `${hoy}T23:59:59` })
      .pipe(catchError(() => of([])))
      .subscribe(citas => this.citasHoy.set(citas.length));

    this.serviciosService
      .getAll()
      .subscribe(servicios => this.totalServicios.set(servicios.length));
  }
}
