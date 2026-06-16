// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass    = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  token = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordsMatchValidator });

  loading  = signal(false);
  errorMsg = signal('');
  exito    = signal(false);
  showPwd  = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    this.token.set(token ?? null);
    if (!token) {
      this.errorMsg.set('El enlace de recuperación no es válido. Solicita uno nuevo.');
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token()) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.resetPassword(this.token()!, this.form.value.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.exito.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'El enlace no es válido o ha expirado.');
      }
    });
  }
}
