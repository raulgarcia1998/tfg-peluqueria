// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading  = signal(false);
  errorMsg = signal('');
  infoMsg  = signal('');
  enviado  = signal(false);

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');
    this.infoMsg.set('');

    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.enviado.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 404) {
          this.infoMsg.set(err?.error?.message ?? 'No hay ninguna cuenta con ese email.');
        } else {
          this.errorMsg.set(err?.error?.message ?? 'No se ha podido procesar la solicitud. Inténtalo de nuevo.');
        }
      }
    });
  }
}
