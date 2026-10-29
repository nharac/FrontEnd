import { MatIconModule } from '@angular/material/icon';
import { Mascota } from '../../../../shared/components/mascota/mascota';
import { Component, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginForm } from './login-form/login-form';
import { RegistroForm } from './registro-form/registro-form';


@Component({
  selector: 'app-auth',
  imports: [CommonModule, MatIconModule, LoginForm, RegistroForm, Mascota],
  styleUrl: './auth.scss',
  templateUrl: './auth.html',
  host: {
    '(mousemove)': 'seguirMouse($event)',
    '(mouseleave)': 'soltarMouse()',
  },
})
export class Auth {

  /** Símbolos que flotan en el fondo. */
  readonly simbolos = ['∫', '∂', 'π', '√x', '∑', 'lim', 'dx', '∞', 'f(x)', 'Δ', 'eˣ', 'sen x'];

  /** true = modo registro, false = modo login. */
  modoRegistro = signal(false);

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private frame = 0;
  private readonly quieto = typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * La tarjeta se inclina un poco hacia el mouse y una luz lo sigue por el fondo.
   * Se actualiza como máximo una vez por cuadro (requestAnimationFrame).
   */
  seguirMouse(e: MouseEvent): void {
    if (this.quieto || this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const el = this.host.nativeElement;
      const caja = el.getBoundingClientRect();
      const x = (e.clientX - caja.left) / caja.width - 0.5;   // -0.5 … 0.5
      const y = (e.clientY - caja.top) / caja.height - 0.5;
      el.style.setProperty('--mx', `${e.clientX - caja.left}px`);
      el.style.setProperty('--my', `${e.clientY - caja.top}px`);
      el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
      el.style.setProperty('--px', `${(x * -24).toFixed(1)}px`);
      el.style.setProperty('--py', `${(y * -24).toFixed(1)}px`);
    });
  }

  soltarMouse(): void {
    const el = this.host.nativeElement;
    ['--rx', '--ry', '--px', '--py'].forEach(v => el.style.setProperty(v, '0'));
  }

  /** Alterna entre login y registro. */
  toggleModo(): void {
    this.modoRegistro.update(v => !v);
  }
}