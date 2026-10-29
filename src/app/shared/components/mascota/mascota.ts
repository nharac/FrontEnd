import { Component, computed, input } from '@angular/core';

/** Cómo se ve Sumi. */
export type EstadoMascota = 'feliz' | 'saludo' | 'pensando' | 'celebra' | 'nervioso' | 'animo';

/** Lo que lleva puesto o en la mano según el módulo. */
export type AccesorioMascota = 'ninguno' | 'gafas' | 'birrete' | 'lapiz' | 'cronometro' | 'lupa' | 'trofeo' | 'libro';

/**
 * Sumi, la mascota de SAESU: un frailejón del páramo de Sumapaz (cerca de Fusagasugá)
 * con bufanda de la U y una integral en la punta.
 * Es solo SVG + CSS (estilos en src/saesu-mascota.scss), sin imágenes.
 *
 * Uso: <app-mascota estado="celebra" accesorio="trofeo" [tamano]="140" />
 */
@Component({
  selector: 'app-mascota',
  templateUrl: './mascota.html',
  host: {
    '[class]': 'clases()',
    '[style.--sumi-tamano.px]': 'tamano()',
    '[attr.role]': 'etiqueta() ? "img" : null',
    '[attr.aria-label]': 'etiqueta() || null',
    '[attr.aria-hidden]': 'etiqueta() ? null : "true"',
  },
})
export class Mascota {
  estado = input<EstadoMascota>('feliz');
  accesorio = input<AccesorioMascota>('ninguno');
  /** Ancho en píxeles (el alto se ajusta solo). */
  tamano = input(120);
  /** false = quieta (para avatares pequeños o listas). */
  animada = input(true);
  /** Texto para lectores de pantalla; vacío = decorativa. */
  etiqueta = input('');

  clases = computed(() => `sumi sumi--${this.estado()} sumi--con-${this.accesorio()}${this.animada() ? ' sumi--animada' : ''}`);
}
