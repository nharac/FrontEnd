import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models';

@Component({
  selector: 'app-login-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  styleUrl: './login-form.scss',
  templateUrl: './login-form.html',
})
export class LoginForm {

  @Output() cambiarModo = new EventEmitter<void>();

  cargando = signal(false);
  mostrarPassword = signal(false);

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get correo() { return this.loginForm.get('correo'); }
  get password() { return this.loginForm.get('password'); }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const request: LoginRequest = this.loginForm.value;

    this.authService.login(request).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.snackBar.open(`Bienvenido, ${res.usuario.nombre}`, 'Cerrar', {
          duration: 3000
        });

        // Redirige según el rol
        if (res.usuario.rol === 'DOCENTE') {
          this.router.navigate(['/docente']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.cargando.set(false);
        this.snackBar.open(err.message || 'Error al iniciar sesión', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}