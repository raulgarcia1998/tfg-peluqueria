// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  returnUrl = computed(() => this.route.snapshot.queryParams['returnUrl']);

  form: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading  = signal(false);
  errorMsg = signal('');
  showPwd  = signal(false);

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    const { email, password } = this.form.value;
    this.auth.login({ email, password }).subscribe({
      next: () => {
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }
        const user = this.auth.currentUser();
        if (user?.rol?.nombre === 'ADMIN' || user?.rol?.nombre === 'EMPLEADO') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Credenciales incorrectas');
      }
    });
  }
}
