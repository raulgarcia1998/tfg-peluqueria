// CC-BY-SA 4.0 — TFG Peluquería

import { Component, inject, signal, computed } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatch(g: AbstractControl): ValidationErrors | null {
  return g.get('password')?.value === g.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  returnUrl = computed(() => this.route.snapshot.queryParams['returnUrl']);

  form: FormGroup = this.fb.group({
    nombre:    ['', Validators.required],
    apellidos: ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    telefono:  [''],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    confirm:   ['', Validators.required]
  }, { validators: passwordMatch });

  get f() { return this.form.controls; }
  loading  = signal(false);
  errorMsg = signal('');

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    const { nombre, apellidos, email, password, telefono } = this.form.value;
    this.auth.register({ nombre, apellidos, email, password, telefono: telefono || undefined }).subscribe({
      next: () => {
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }
        this.router.navigate(['/user/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Error al crear la cuenta');
      }
    });
  }
}
