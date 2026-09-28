import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../services/auth.service';
import { RegistroRequest } from '../../../models';

@Component({
  selector: 'app-registro-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  styleUrl: './registro-form.scss',
  templateUrl: './registro-form.html',
})
export class RegistroForm {

  @Output() cambiarModo = new EventEmitter<void>();

  cargando = signal(false);
  mostrarPassword = signal(false);
  mostrarConfirmPassword = signal(false);

  registroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordsIgualesValidator
    });
  }

  get nombre() { return this.registroForm.get('nombre'); }
  get correo() { return this.registroForm.get('correo'); }
  get password() { return this.registroForm.get('password'); }
  get confirmPassword() { return this.registroForm.get('confirmPassword'); }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update(v => !v);
  }

  toggleMostrarConfirmPassword(): void {
    this.mostrarConfirmPassword.update(v => !v);
  }

  /** Valida que password y confirmPassword sean iguales. */
  private passwordsIgualesValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsDistintas: true };
  };

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const { nombre, correo, password } = this.registroForm.value;
    const request: RegistroRequest = { nombre, correo, password };

    this.authService.registro(request).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.snackBar.open(`Registro exitoso, ${res.usuario.nombre}`, 'Cerrar', {
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
        this.snackBar.open(err.message || 'Error al registrar', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}