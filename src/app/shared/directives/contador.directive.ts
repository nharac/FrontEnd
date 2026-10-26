import { Directive, ElementRef, effect, inject, input, OnDestroy } from '@angular/core';

/**
 * Anima un número desde 0 hasta su valor ("cuenta hacia arriba").
 * Uso: <span [appContador]="puntos"></span>
 * Respeta prefers-reduced-motion: en ese caso muestra el valor directamente.
 */
@Directive({
  selector: '[appContador]',
})
export class ContadorDirective implements OnDestroy {
  appContador = input.required<number>();
  /** Duración en milisegundos. */
  duracion = input(900);
  retraso = input(0);

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private frame = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private formato = new Intl.NumberFormat('es-CO');

  constructor() {
    effect(() => {
      const destino = Number(this.appContador()) || 0;
      const duracion = this.duracion();
      const retraso = this.retraso();
      this.cancelar();

      const quieto = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (quieto || destino === 0) {
        this.pintar(destino);
        return;
      }

      this.pintar(0);
      this.timer = setTimeout(() => {
        const inicio = performance.now();
        const paso = (ahora: number) => {
          const t = Math.min((ahora - inicio) / duracion, 1);
          const suave = 1 - Math.pow(1 - t, 3); // ease-out
          this.pintar(Math.round(destino * suave));
          if (t < 1) this.frame = requestAnimationFrame(paso);
        };
        this.frame = requestAnimationFrame(paso);
      }, retraso);
    });
  }

  ngOnDestroy(): void {
    this.cancelar();
  }

  private pintar(valor: number): void {
    this.el.nativeElement.textContent = this.formato.format(valor);
  }

  private cancelar(): void {
    cancelAnimationFrame(this.frame);
    clearTimeout(this.timer);
  }
}
