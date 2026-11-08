import { BienvenidaService } from '../../../../../core/services/bienvenida.service';
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

const CLAVE_RECORDAR = 'saesu-recordar';

export interface Recordado { correo: string; nombre: string; }

export function leerRecordado(): Recordado | null {
  try {
    const r = JSON.parse(localStorage.getItem(CLAVE_RECORDAR) ?? 'null');
    return r?.correo ? r : null;
  } catch { return null; }
}

export function guardarRecordado(r: Recordado | null): void {
  try {
    if (r) localStorage.setItem(CLAVE_RECORDAR, JSON.stringify(r)); else localStorage.removeItem(CLAVE_RECORDAR);
  } catch { /* sin almacenamiento */ }
}

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

  private bienvenida = inject(BienvenidaService);
  cargando = signal(false);
  mostrarPassword = signal(false);

  /** Para animar la tarjeta del login (tiembla si falla, se despide si entra). */
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  loginForm: FormGroup;

  /** Correo y primer nombre recordados en este navegador (si el usuario lo pidió). */
  recordado = signal<Recordado | null>(leerRecordado());
  recordar = signal(!!leerRecordado());

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
    const r = this.recordado();
    if (r) this.loginForm.patchValue({ correo: r.correo });
  }

  /** "No soy yo": olvida el correo guardado. */
  olvidar(): void {
    this.recordado.set(null);
    this.recordar.set(false);
    this.loginForm.patchValue({ correo: '' });
    try { localStorage.removeItem(CLAVE_RECORDAR); } catch { /* sin almacenamiento */ }
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
        guardarRecordado(this.recordar() ? { correo: request.correo, nombre: res.usuario.nombre.trim().split(/\s+/)[0] } : null);
        // Sumi le da la bienvenida encima de la pantalla de inicio
        this.bienvenida.mostrar({
          nombre: res.usuario.nombre,
          nuevo: false,
          esDocente: esDocente(res.usuario.rol),
          racha: res.usuario.rachaActual ?? null,
          puntos: res.usuario.puntosTotales ?? null
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
