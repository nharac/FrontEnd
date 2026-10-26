import { Component, input, output, signal } from '@angular/core';

/**
 * Botón "ver / ocultar contraseña" con animación:
 * al ocultar, el ojo parpadea y una línea lo tacha; al mostrar, la línea se borra y la pupila vuelve.
 * Uso: <app-ojo-password [visible]="mostrar()" (alternar)="toggle()" />
 */
@Component({
  selector: 'app-ojo-password',
  templateUrl: './ojo-password.html',
  styleUrl: './ojo-password.scss',
})
export class OjoPassword {

  /** true = la contraseña se está mostrando en texto plano. */
  visible = input(false);
  alternar = output<void>();

  /** Alterna entre dos clases idénticas para reiniciar la animación de parpadeo en cada clic. */
  parpadeo = signal<'a' | 'b' | null>(null);

  clic(): void {
    this.parpadeo.update(p => (p === 'a' ? 'b' : 'a'));
    this.alternar.emit();
  }
}
