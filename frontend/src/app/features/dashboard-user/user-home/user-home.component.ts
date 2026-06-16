// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-home.component.html'
})
export class UserHomeComponent {
  private auth = inject(AuthService);

  nombre = computed(() => this.auth.currentUser()?.nombre ?? 'Cliente');
}
