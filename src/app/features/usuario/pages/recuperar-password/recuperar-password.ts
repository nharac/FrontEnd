import { Component, ElementRef, OnDestroy, OnInit, computed, inject, signal, viewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../services/auth.service';
import { Logo } from '../../../../shared/components/logo/logo';
import { OjoPassword } from '../../../../shared/components/ojo-password/ojo-password';

type Paso = 'correo' | 'codigo' | 'password' | 'listo';

/**
 * /auth/recuperar — "¿Olvidaste tu contraseña?"
 *  1. El usuario escribe su correo y el backend le envía un código de 6 dígitos (vence en 15 min).
 *  2. Escribe el código y el backend comprueba que sea válido (sin gastarlo).
 *  3. Solo con un código válido aparece el formulario de la contraseña nueva (mismas reglas del registro).
 *  4. Listo: vuelve a iniciar sesión.
 */
@Component({
  selector: 'app-recuperar-password',
  imports: [RouterLink, FormsModule, MatIconModule, Logo, OjoPassword],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.scss',
})
export class RecuperarPassword implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Símbolos que flotan en el fondo (mismo estilo del login). */
  readonly simbolos = ['∫', '∂', 'π', '√x', '∑', 'lim', 'dx', '∞', 'f(x)'];
  readonly posiciones = [0, 1, 2, 3, 4, 5];

  paso = signal<Paso>('correo');
  correo = signal('');
  digitos = signal<string[]>(['', '', '', '', '', '']);
  password = signal('');
  confirmar = signal('');
  verPassword = signal(false);
  verConfirmar = signal(false);

  enviando = signal(false);
  error = signal('');
  aviso = signal('');
  /** Segundos que faltan para poder pedir otro código. */
  espera = signal(0);
  sacudir = signal(false);

  private cajas = viewChildren<ElementRef<HTMLInputElement>>('caja');
  private timer: ReturnType<typeof setInterval> | undefined;

  codigo = computed(() => this.digitos().join(''));

  correoValido = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo().trim()));

  /** El correo con la parte del usuario oculta: l***@ucundinamarca.edu.co */
  correoOculto = computed(() => {
    const [usuario, dominio] = this.correo().trim().split('@');
    return usuario ? `${usuario[0]}${'•'.repeat(Math.max(2, Math.min(usuario.length - 1, 6)))}@${dominio}` : '';
  });

  /** Reglas de la contraseña (las mismas que valida el backend). */
  reglas = computed(() => {
    const p = this.password();
    return [
      { texto: 'Mínimo 8 caracteres', ok: p.length >= 8 },
      { texto: 'Una mayúscula', ok: /[A-Z]/.test(p) },
      { texto: 'Una minúscula', ok: /[a-z]/.test(p) },
      { texto: 'Un número', ok: /[0-9]/.test(p) },
      { texto: 'Un carácter especial (@#$%^&+=!)', ok: /[@#$%^&+=!]/.test(p) },
    ];
  });

  passwordValida = computed(() => this.reglas().every(r => r.ok));
  coinciden = computed(() => this.confirmar().length > 0 && this.confirmar() === this.password());
  puedeCambiar = computed(() => this.passwordValida() && this.coinciden());

  ngOnInit(): void {
    const correo = this.route.snapshot.queryParamMap.get('correo');
    if (correo) {
      this.correo.set(correo);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  // ---------- Paso 1 ----------

  pedirCodigo(): void {
    this.error.set('');
    if (!this.correoValido()) {
      this.fallar('Escribe un correo válido.');
      return;
    }
    if (this.enviando() || this.espera() > 0) {
      return;
    }
    this.enviando.set(true);
    this.authService.solicitarRecuperacion(this.correo().trim()).subscribe({
      next: () => {
        this.enviando.set(false);
        const reenvio = this.paso() === 'codigo';
        this.paso.set('codigo');
        this.aviso.set(reenvio ? 'Te enviamos un código nuevo. El anterior ya no sirve.' : '');
        this.digitos.set(['', '', '', '', '', '']);
        this.iniciarEspera();
        setTimeout(() => this.enfocar(0), 50);
      },
      error: (err) => {
        this.enviando.set(false);
        this.fallar(err?.status === 429
          ? 'Hiciste muchos intentos. Espera un minuto e intenta de nuevo.'
          : err?.message || 'No se pudo enviar el código. Intenta de nuevo.');
      }
    });
  }

  private iniciarEspera(): void {
    this.espera.set(60);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.espera.update(s => Math.max(0, s - 1));
      if (this.espera() === 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  // ---------- Paso 2: las 6 cajas del código ----------

  escribirDigito(i: number, evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const solo = input.value.replace(/\D/g, '');
    if (solo.length > 1) {
      // Pegó o el teclado autocompletó el código entero
      this.pegarCodigo(solo, i);
      return;
    }
    this.digitos.update(d => d.map((v, j) => (j === i ? solo : v)));
    input.value = solo;
    if (solo && i < 5) {
      this.enfocar(i + 1);
    }
    if (this.codigo().length === 6) {
      this.validarCodigo();
    }
  }

  teclaDigito(i: number, evento: KeyboardEvent): void {
    if (evento.key === 'Backspace' && !this.digitos()[i] && i > 0) {
      this.digitos.update(d => d.map((v, j) => (j === i - 1 ? '' : v)));
      this.enfocar(i - 1);
      evento.preventDefault();
    } else if (evento.key === 'ArrowLeft' && i > 0) {
      this.enfocar(i - 1);
    } else if (evento.key === 'ArrowRight' && i < 5) {
      this.enfocar(i + 1);
    }
  }

  pegar(evento: ClipboardEvent): void {
    const texto = (evento.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    if (texto) {
      evento.preventDefault();
      this.pegarCodigo(texto, 0);
    }
  }

  private pegarCodigo(texto: string, desde: number): void {
    const d = [...this.digitos()];
    for (let k = 0; k < texto.length && desde + k < 6; k++) {
      d[desde + k] = texto[k];
    }
    this.digitos.set(d);
    this.cajas().forEach((c, j) => (c.nativeElement.value = d[j]));
    this.enfocar(Math.min(5, desde + texto.length));
    if (this.codigo().length === 6) {
      this.validarCodigo();
    }
  }

  private enfocar(i: number): void {
    const caja = this.cajas()[i]?.nativeElement;
    caja?.focus();
    caja?.select();
  }

  /** Paso 2: comprueba el código; si es válido, pasa al formulario de la contraseña nueva. */
  validarCodigo(): void {
    this.error.set('');
    this.aviso.set('');
    if (this.codigo().length < 6) {
      this.fallar('Escribe los 6 dígitos del código.');
      return;
    }
    if (this.enviando()) return;
    this.enviando.set(true);
    this.authService.validarCodigoRecuperacion(this.correo().trim(), this.codigo()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.paso.set('password');
      },
      error: (err) => {
        this.enviando.set(false);
        this.fallar(err?.status === 429
          ? 'Hiciste muchos intentos. Espera un minuto e intenta de nuevo.'
          : err?.message || 'No se pudo comprobar el código.');
        this.digitos.set(['', '', '', '', '', '']);
        this.cajas().forEach(c => (c.nativeElement.value = ''));
        setTimeout(() => this.enfocar(0), 50);
      }
    });
  }

  cambiarPassword(): void {
    this.error.set('');
    this.aviso.set('');
    if (!this.puedeCambiar()) {
      this.fallar('Revisa la nueva contraseña.');
      return;
    }
    this.enviando.set(true);
    this.authService.restablecerPassword({
      correo: this.correo().trim(),
      codigo: this.codigo(),
      passwordNueva: this.password()
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        clearInterval(this.timer);
        this.paso.set('listo');
      },
      error: (err) => {
        this.enviando.set(false);
        this.fallar(err?.status === 429
          ? 'Hiciste muchos intentos. Espera un minuto e intenta de nuevo.'
          : err?.message || 'No se pudo cambiar la contraseña.');
        // El código venció mientras escribía la contraseña: vuelve al paso del código
        if (/código/i.test(err?.message ?? '')) {
          this.digitos.set(['', '', '', '', '', '']);
          this.paso.set('codigo');
          setTimeout(() => this.enfocar(0), 50);
        }
      }
    });
  }

  cambiarCorreo(): void {
    this.paso.set('correo');
    this.error.set('');
    this.aviso.set('');
  }

  irAlLogin(): void {
    this.router.navigate(['/auth']);
  }

  /** Muestra el error y sacude la tarjeta. */
  private fallar(mensaje: string): void {
    this.error.set(mensaje);
    this.sacudir.set(false);
    setTimeout(() => this.sacudir.set(true));
  }
}
