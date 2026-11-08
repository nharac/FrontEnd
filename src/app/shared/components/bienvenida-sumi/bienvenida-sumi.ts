import { Component, OnDestroy, computed, effect, inject, signal, untracked } from '@angular/core';
import { PuntosSumi } from '../puntos-sumi/puntos-sumi';
import { MatIconModule } from '@angular/material/icon';
import { Mascota } from '../mascota/mascota';
import { Confeti } from '../confeti/confeti';
import { BienvenidaService } from '../../../core/services/bienvenida.service';
import { Elegir, Titulo, alAzar, mensajeBienvenida, tituloBienvenida } from './bienvenida-sumi.textos';

interface Chip { icono: string; texto: string }

/** Tiempo en pantalla antes de cerrarse sola (ms). */
const DURACION = { regreso: 7000, nuevo: 9000 };
const SALIDA_MS = 450;

/**
 * Bienvenida animada: Sumi sube saltando, saluda y dice algo según quién entra.
 * - Cuenta nueva: Sumi celebra con birrete, confeti y lo que puede hacer en SAESU.
 * - Regreso: Sumi saluda con la mano y le recuerda su racha y sus Puntos Sumi.
 * - Docente: Sumi con gafas le recuerda que sus estudiantes lo esperan.
 * Se cierra sola, con clic, con Esc o con el botón; respeta "reducir movimiento".
 */
@Component({
  selector: 'app-bienvenida-sumi',
  imports: [Mascota, Confeti, MatIconModule, PuntosSumi],
  templateUrl: './bienvenida-sumi.html',
  styleUrl: './bienvenida-sumi.scss',
  host: { '(document:keydown.escape)': 'cerrar()' },
})
export class BienvenidaSumi implements OnDestroy {
  private readonly servicio = inject(BienvenidaService);

  datos = this.servicio.actual;
  saliendo = signal(false);
  /** El mensaje se va escribiendo letra por letra, como si Sumi hablara. */
  escrito = signal('');
  readonly tamanoSumi = typeof innerWidth === 'number' && innerWidth < 480 ? 160 : 230;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private timerSalida: ReturnType<typeof setTimeout> | undefined;
  private escritura: ReturnType<typeof setInterval> | undefined;
  private inicioEscritura: ReturnType<typeof setTimeout> | undefined;

  primerNombre = computed(() => (this.datos()?.nombre ?? '').trim().split(/\s+/)[0] || '');
  duracion = computed(() => (this.datos()?.nuevo ? DURACION.nuevo : DURACION.regreso));

  /** Se puede cambiar en las pruebas para que los textos no salgan al azar. */
  elegir: Elegir = alAzar;
  ahora = (): Date => new Date();

  titulo = computed<Titulo | null>(() => {
    const d = this.datos();
    return d ? tituloBienvenida(d, this.primerNombre(), this.ahora().getHours(), this.elegir) : null;
  });

  mensaje = computed(() => {
    const d = this.datos();
    return d ? mensajeBienvenida(d, this.ahora().getHours(), this.elegir) : '';
  });

  chips = computed<Chip[]>(() => {
    const d = this.datos();
    if (!d) return [];
    if (d.nuevo && d.esDocente) {
      return [{ icono: 'groups', texto: 'Progreso del grupo' }, { icono: 'quiz', texto: 'Banco de preguntas' },
              { icono: 'forum', texto: 'Foro con respuestas oficiales' }];
    }
    if (d.nuevo) {
      return [{ icono: 'edit_note', texto: 'Práctica tipo ICFES' }, { icono: 'smart_toy', texto: 'Tutor con IA' },
              { icono: 'puntos', texto: 'Puntos Sumi y logros' }];
    }
    const chips: Chip[] = [];
    if ((d.racha ?? 0) > 0) chips.push({ icono: 'local_fire_department', texto: `${d.racha} ${d.racha === 1 ? 'día' : 'días'} de racha` });
    if ((d.puntos ?? 0) > 0) chips.push({ icono: 'puntos', texto: `${d.puntos} Puntos Sumi` });
    return chips;
  });

  constructor() {
    // Cada vez que llega una bienvenida nueva se programa su cierre automático
    effect(() => {
      const d = this.datos();
      untracked(() => {
        clearTimeout(this.timer);
        clearTimeout(this.timerSalida);
        this.saliendo.set(false);
        this.escribir(d ? this.mensaje() : '');
        if (d) this.timer = setTimeout(() => this.cerrar(), this.duracion());
      });
    });
  }

  cerrar(): void {
    if (!this.datos() || this.saliendo()) return;
    clearTimeout(this.timer);
    this.saliendo.set(true);
    this.timerSalida = setTimeout(() => {
      this.saliendo.set(false);
      this.servicio.cerrar();
    }, SALIDA_MS);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    clearTimeout(this.timerSalida);
    clearInterval(this.escritura);
    clearTimeout(this.inicioEscritura);
  }

  /** Sin matchMedia (pruebas) o con "reducir movimiento" no hay animaciones. */
  movimientoReducido(): boolean {
    return typeof matchMedia !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Escribe el texto poco a poco cuando Sumi ya aterrizó (de una vez si se reduce el movimiento). */
  private escribir(texto: string): void {
    clearInterval(this.escritura);
    clearTimeout(this.inicioEscritura);
    if (!texto || this.movimientoReducido()) {
      this.escrito.set(texto);
      return;
    }
    this.escrito.set('');
    const letras = Array.from(texto); // por caracteres completos: los emojis no se parten
    let i = 0;
    this.inicioEscritura = setTimeout(() => {
      this.escritura = setInterval(() => {
        i++;
        this.escrito.set(letras.slice(0, i).join(''));
        if (i >= letras.length) clearInterval(this.escritura);
      }, 26);
    }, 1100);
  }
}
