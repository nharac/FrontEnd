import { Component, booleanAttribute, computed, inject, input } from '@angular/core';
import {
  BUFANDAS, BufandaSumi, CaraSumi, EspaldaSumi, EstiloSumiService, FondoSumi, ObjetoSumi, RopaSumi, SombreroSumi
} from '../../../core/services/estilo-sumi.service';
import { DIBUJOS_CABEZA, DIBUJOS_CARA, DIBUJOS_ESPALDA, DIBUJOS_FONDO, DIBUJOS_MANO, DIBUJOS_ROPA, DISFRAZ_COMPLETO, TAPAN_BUFANDA, TAPAN_FLOR } from './sumi-prendas';

/** Cada Sumi necesita su propio id para recortar el fondo en círculo. */
let contadorFondos = 0;
import { SumiDibujo } from './sumi-dibujo';

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
 * Si no se le pasa sombrero ni bufanda, lleva los que la persona eligió en el vestidor.
 */
@Component({
  selector: 'app-mascota',
  imports: [SumiDibujo],
  templateUrl: './mascota.html',
  host: {
    '[class]': 'clases()',
    '[style.--sumi-buf-base]': 'coloresBufanda()[0]',
    '[style.--sumi-buf-raya]': 'coloresBufanda()[1]',
    '[style.--sumi-buf-punta]': 'coloresBufanda()[2]',
    '[style.--sumi-buf-atras]': 'coloresBufanda()[3]',
    '[style.--sumi-buf-texto]': 'coloresBufanda()[4] ?? null',
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
  /** Estilo fijo (por ejemplo, en las vistas previas del vestidor). null = el elegido en el vestidor. */
  sombrero = input<SombreroSumi | null>(null);
  bufanda = input<BufandaSumi | null>(null);
  cara = input<CaraSumi | null>(null);
  ropa = input<RopaSumi | null>(null);
  objeto = input<ObjetoSumi | null>(null);
  espalda = input<EspaldaSumi | null>(null);
  /** Fondo fijo (vistas previas del vestidor). */
  fondo = input<FondoSumi | null>(null);
  /** true = muestra el fondo elegido en el vestidor (solo donde Sumi aparece grande). */
  conFondo = input(false, { transform: booleanAttribute });
  /** true = Sumi clásica, sin nada del vestidor (los íconos de Puntos Sumi y Sumi Monedas). */
  clasica = input(false, { transform: booleanAttribute });
  readonly idFondo = `sumi-fondo-${++contadorFondos}`;

  private estilo = inject(EstiloSumiService);

  // Lo que lleva puesto: lo que pida el componente o, si no, lo elegido en el vestidor
  private sombreroPuesto = computed(() => this.sombrero() ?? (this.clasica() ? 'ninguno' : this.estilo.sombrero()));
  private caraPuesta = computed(() => this.cara() ?? (this.clasica() ? 'ninguno' : this.estilo.cara()));
  private ropaPuesta = computed(() => this.ropa() ?? (this.clasica() ? 'ninguno' : this.estilo.ropa()));
  private objetoPuesto = computed(() => this.objeto() ?? (this.clasica() ? 'ninguno' : this.estilo.objeto()));
  private espaldaPuesta = computed(() => this.espalda() ?? (this.clasica() ? 'ninguno' : this.estilo.espalda()));
  private bufandaPuesta = computed(() => this.bufanda() ?? (this.clasica() ? 'saesu' : this.estilo.bufanda()));

  // El birrete y las gafas de cada módulo tienen prioridad sobre lo del vestidor
  dibujoSombrero = computed(() => this.accesorio() === 'birrete' ? '' : DIBUJOS_CABEZA[this.sombreroPuesto()] ?? '');
  dibujoCara = computed(() => this.accesorio() === 'gafas' ? '' : DIBUJOS_CARA[this.caraPuesta()] ?? '');
  dibujoRopa = computed(() => DIBUJOS_ROPA[this.ropaPuesta()]?.cuerpo ?? '');
  dibujoMangas = computed(() => DIBUJOS_ROPA[this.ropaPuesta()]?.mangas ?? '');
  dibujoObjeto = computed(() => DIBUJOS_MANO[this.objetoPuesto()] ?? '');
  dibujoEspaldaAtras = computed(() => DIBUJOS_ESPALDA[this.espaldaPuesta()]?.atras ?? '');
  dibujoEspaldaFrente = computed(() => DIBUJOS_ESPALDA[this.espaldaPuesta()]?.frente ?? '');
  dibujoFondo = computed(() => DIBUJOS_FONDO[this.fondo() ?? (this.conFondo() && !this.clasica() ? this.estilo.fondo() : 'ninguno')] ?? '');
  coloresBufanda = computed(() => (BUFANDAS.find(b => b.id === this.bufandaPuesta()) ?? BUFANDAS[0]).colores);

  clases = computed(() => `sumi sumi--${this.estado()} sumi--con-${this.accesorio()} sumi--b-${this.bufandaPuesta()}`
    + (this.dibujoSombrero() && TAPAN_FLOR.has(this.sombreroPuesto()) ? ' sumi--sin-flor' : '')
    + (this.dibujoObjeto() ? ' sumi--con-objeto' : '')
    + (TAPAN_BUFANDA.has(this.ropaPuesta()) ? ' sumi--sin-bufanda' : '')
    + (DISFRAZ_COMPLETO.has(this.ropaPuesta()) ? ' sumi--disfraz' : '')
    + (this.dibujoFondo() ? ' sumi--con-fondo' : '')
    + (this.animada() ? ' sumi--animada' : ''));
}
