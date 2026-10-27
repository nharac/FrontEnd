import { Aviso } from '../../../../../shared/components/aviso/aviso';
import { DatosAviso } from '../../../../../shared/components/aviso/aviso.model';
import { RouterLink } from '@angular/router';
import { OjoPassword } from '../../../../../shared/components/ojo-password/ojo-password';
import { Logo } from '../../../../../shared/components/logo/logo';
import { Component, ElementRef, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models';
import { esDocente } from '../../../../../shared/utils/rol';

@Component({
  selector: 'app-login-form',
  imports: [OjoPassword, Logo, RouterLink, 
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  styleUrl: './login-form.scss',
  templateUrl: './login-form.html',
})
export class LoginForm {

  @Output() cambiarModo = new EventEmitter<void>();

  cargando = signal(false);
  mostrarPassword = signal(false);

  /** Para animar la tarjeta del login (tiembla si falla, se despide si entra). */
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

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
        // Bienvenida con saludo según la hora, foto o iniciales y una mano que saluda
        this.snackBar.openFromComponent(Aviso, {
          data: {
            tipo: 'bienvenida',
            mensaje: 'Qué bueno verte de nuevo en SAESU.',
            nombre: res.usuario.nombre,
            fotoUrl: res.usuario.fotoPerfilUrl ?? null,
            esDocente: esDocente(res.usuario.rol)
          } satisfies DatosAviso,
          duration: 4500,
          verticalPosition: 'top',
          horizontalPosition: 'end'
        });

        // La tarjeta se despide y luego redirige según el rol
        const destino = esDocente(res.usuario.rol) ? '/docente' : '/dashboard';
        this.animarTarjeta('container--exito');
        setTimeout(() => this.router.navigate([destino]), this.animaciones() ? 450 : 0);
      },
      error: (err) => {
        this.cargando.set(false);
        this.animarTarjeta('container--error', 600);
        this.snackBar.open(err.message || 'Error al iniciar sesión', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  private animaciones(): boolean {
    return !matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Pone una clase de animación en la tarjeta; si se da duración, la quita al terminar. */
  private animarTarjeta(clase: string, duracionMs?: number): void {
    const tarjeta = this.host.nativeElement.closest<HTMLElement>('.container');
    if (!tarjeta || !this.animaciones()) return;
    tarjeta.classList.remove(clase);
    void tarjeta.offsetWidth; // reinicia la animación si se repite
    tarjeta.classList.add(clase);
    if (duracionMs) setTimeout(() => tarjeta.classList.remove(clase), duracionMs);
  }
}
