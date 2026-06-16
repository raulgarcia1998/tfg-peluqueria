// CC-BY-SA 4.0 — TFG Peluquería
// Página de inicio del panel admin

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-home.component.html'
})
export class AdminHomeComponent {}
