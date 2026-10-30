import { Component, ElementRef, OnDestroy, OnInit, computed, inject, signal, viewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../services/auth.service';
import { Aviso } from '../../../../shared/components/aviso/aviso';
import { DatosAviso } from '../../../../shared/components/aviso/aviso.model';
import { esDocente } from '../../../../shared/utils/rol';

/**
 * /auth/verificar?correo=... — doble verificación al crear la cuenta.
 * El estudiante escribe el código de 6 dígitos que llegó a su correo institucional;
 * recién al acertar se crea la cuenta y se abre la sesión sin volver a escribir la contraseña.
 * Usa los estilos de /auth/recuperar (misma tarjeta, cajas de código y fondo).
 */
@Component({
  selector: 'app-verificar-correo',
  imports: [RouterLink, MatIconModule],
  templateUrl: './verificar-correo.html',
  styleUrl: '../recuperar-password/recuperar-password.scss',
})
export class VerificarCorreo implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly simbolos = ['∫', '∂', 'π', '√x', '∑', 'lim', 'dx', '∞', 'f(x)'];
  readonly posiciones = [0, 1, 2, 3, 4, 5];

  correo = signal('');
  digitos = signal<string[]>(['', '', '', '', '', '']);
  enviando = signal(false);
  error = signal('');
  aviso = signal('');
  espera = signal(0);
  sacudir = signal(false);
  listo = signal(false);

  private cajas = viewChildren<ElementRef<HTMLInputElement>>('caja');
  private timer: ReturnType<typeof setInterval> | undefined;

  codigo = computed(() => this.digitos().join(''));

  /** l•••••@ucundinamarca.edu.co */
  correoOculto = computed(() => {
    const [usuario, dominio] = this.correo().trim().split('@');
    return usuario && dominio ? `${usuario[0]}${'•'.repeat(Math.max(2, Math.min(usuario.length - 1, 6)))}@${dominio}` : '';
  });

  ngOnInit(): void {
    const correo = this.route.snapshot.queryParamMap.get('correo') ?? '';
    if (!correo) {
      void this.router.navigate(['/auth']);
      return;
    }
    this.correo.set(correo);
    // El registro (o el login) acaba de enviar un código: se espera un minuto antes de pedir otro
    this.iniciarEspera();
    setTimeout(() => this.enfocar(0), 80);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  verificar(): void {
    this.error.set('');
    if (this.codigo().length < 6) {
      this.fallar('Escribe los 6 dígitos del código.');
      return;
    }
    if (this.enviando()) return;
    this.enviando.set(true);
    this.authService.verificarCorreo(this.correo().trim(), this.codigo()).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.listo.set(true);
        clearInterval(this.timer);
        this.snackBar.openFromComponent(Aviso, {
          data: {
            tipo: 'bienvenida',
            mensaje: 'Tu cuenta está lista. ¡Empieza a practicar!',
            nombre: res.usuario.nombre
          } satisfies DatosAviso,
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'end'
        });
        setTimeout(() => this.router.navigate([esDocente(res.usuario.rol) ? '/docente' : '/dashboard']), 1400);
      },
      error: (err) => {
        this.enviando.set(false);
        this.fallar(err?.status === 429
          ? 'Hiciste muchos intentos. Espera un minuto e intenta de nuevo.'
          : err?.message || 'No se pudo verificar el código.');
        this.limpiarCajas();
      }
    });
  }

  reenviar(): void {
    if (this.enviando() || this.espera() > 0) return;
    this.error.set('');
    this.enviando.set(true);
    this.authService.reenviarVerificacion(this.correo().trim()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.aviso.set('Te enviamos un código nuevo. El anterior ya no sirve.');
        this.limpiarCajas();
        this.iniciarEspera();
      },
      error: (err) => {
        this.enviando.set(false);
        this.fallar(err?.message || 'No se pudo enviar el código.');
      }
    });
  }

  // ---------- Las 6 cajas ----------

  escribirDigito(i: number, evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const solo = input.value.replace(/\D/g, '');
    if (solo.length > 1) {
      this.pegarCodigo(solo, i);
      return;
    }
    this.digitos.update(d => d.map((v, j) => (j === i ? solo : v)));
    input.value = solo;
    if (solo && i < 5) this.enfocar(i + 1);
    if (this.codigo().length === 6) this.verificar();
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
    for (let k = 0; k < texto.length && desde + k < 6; k++) d[desde + k] = texto[k];
    this.digitos.set(d);
    this.cajas().forEach((c, j) => (c.nativeElement.value = d[j]));
    this.enfocar(Math.min(5, desde + texto.length));
    if (this.codigo().length === 6) this.verificar();
  }

  private limpiarCajas(): void {
    this.digitos.set(['', '', '', '', '', '']);
    this.cajas().forEach(c => (c.nativeElement.value = ''));
    setTimeout(() => this.enfocar(0), 50);
  }

  private enfocar(i: number): void {
    const caja = this.cajas()[i]?.nativeElement;
    caja?.focus();
    caja?.select();
  }

  private iniciarEspera(): void {
    this.espera.set(60);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.espera.update(s => Math.max(0, s - 1));
      if (this.espera() === 0) clearInterval(this.timer);
    }, 1000);
  }

  private fallar(mensaje: string): void {
    this.error.set(mensaje);
    this.sacudir.set(false);
    setTimeout(() => this.sacudir.set(true));
  }
}
