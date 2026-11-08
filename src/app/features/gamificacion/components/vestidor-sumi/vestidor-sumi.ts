import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Mascota } from '../../../../shared/components/mascota/mascota';
import { MonedaSumi } from '../../../../shared/components/moneda-sumi/moneda-sumi';
import {
  BUFANDAS, BufandaSumi, CARAS, CaraSumi, ESPALDAS, EspaldaSumi, EstiloSumiService, FONDOS, FondoSumi, OBJETOS, ObjetoSumi,
  PrendaSumi, SOMBREROS, SombreroSumi
} from '../../../../core/services/estilo-sumi.service';
import { CategoriaSumi, MovimientoMoneda, TiendaSumiService } from '../../services/tienda-sumi.service';

type Pestana = 'sombreros' | 'caras' | 'objetos' | 'espaldas' | 'bufandas' | 'fondos';

interface InfoPestana { id: Pestana; categoria: CategoriaSumi; nombre: string; icono: string; lista: PrendaSumi<string>[] }

/** Pestañas del vestidor: qué catálogo muestra y con qué nombre lo conoce el backend. */
const PESTANAS: InfoPestana[] = [
  { id: 'sombreros', categoria: 'sombrero', nombre: 'Cabeza', icono: 'face', lista: SOMBREROS },
  { id: 'caras', categoria: 'cara', nombre: 'Cara', icono: 'eyeglasses', lista: CARAS },
  { id: 'objetos', categoria: 'objeto', nombre: 'Mano', icono: 'devices', lista: OBJETOS },
  { id: 'espaldas', categoria: 'espalda', nombre: 'Espalda', icono: 'backpack', lista: ESPALDAS },
  { id: 'bufandas', categoria: 'bufanda', nombre: 'Bufanda', icono: 'dry_cleaning', lista: BUFANDAS },
  { id: 'fondos', categoria: 'fondo', nombre: 'Fondo', icono: 'wallpaper', lista: FONDOS },
];

/** Cómo se ganan las Sumi Monedas (las mismas reglas del backend, PuntosService). */
export const COMO_GANAR_MONEDAS = [
  { icono: 'check_circle', texto: 'Acertar en la práctica', monedas: '2 a 4' },
  { icono: 'forum', texto: 'Responder en el foro (hasta 3 al día)', monedas: '3' },
  { icono: 'verified', texto: 'Que un docente marque tu respuesta como oficial', monedas: '10' },
  { icono: 'local_fire_department', texto: 'Mantener la racha cada día', monedas: '2' },
  { icono: 'emoji_events', texto: 'Cada 7 días seguidos de racha', monedas: '+15' },
];

/** Prenda que se está probando antes de comprarla. */
interface Prueba { pestana: InfoPestana; prenda: PrendaSumi<string> }

/**
 * Vestidor de Sumi: cabeza, cara, objeto en la mano, espalda, bufanda y fondo.
 * Las prendas se compran con Sumi Monedas (se ganan practicando, en el foro y con la racha);
 * antes de comprar se pueden probar. Los docentes tienen todo gratis.
 * Lo que se pone se guarda en el servidor y se le ve a Sumi en toda la app.
 */
@Component({
  selector: 'app-vestidor-sumi',
  imports: [MatIconModule, Mascota, MonedaSumi],
  template: `
    <section class="vs" aria-labelledby="vs-titulo">
      <header class="vs__cabecera">
        <h2 id="vs-titulo"><mat-icon>checkroom</mat-icon> Vestidor de Sumi</h2>
        @if (tienda.docente()) {
          <span class="vs__saldo vs__saldo--docente"><mat-icon>verified</mat-icon> Todo gratis para docentes</span>
        } @else {
          <span class="vs__saldo" title="Tus Sumi Monedas"><app-moneda-sumi [tamano]="22" /> {{ tienda.monedas() }} <small>Sumi Monedas</small></span>
        }
      </header>

      <div class="vs__cuerpo">
        <div class="vs__escenario">
          <app-mascota [estado]="saluda() ? 'celebra' : 'feliz'" [tamano]="150" conFondo
                       [sombrero]="$any(prueba('sombreros'))" [cara]="$any(prueba('caras'))" [objeto]="$any(prueba('objetos'))"
                       [espalda]="$any(prueba('espaldas'))" [bufanda]="$any(prueba('bufandas'))" [fondo]="$any(prueba('fondos'))"
                       etiqueta="Sumi con el estilo que elegiste" />
          @if (probando(); as pr) {
            <div class="vs__compra">
              <p>Probándote <b>{{ pr.prenda.nombre }}</b></p>
              <button type="button" class="vs__comprar" [disabled]="comprando() || faltan(pr.prenda) > 0" (click)="comprar()">
                <app-moneda-sumi [tamano]="18" /> {{ comprando() ? 'Comprando…' : 'Comprar por ' + pr.prenda.precio }}
              </button>
              @if (faltan(pr.prenda) > 0) {
                <small class="vs__faltan">Te faltan {{ faltan(pr.prenda) }} monedas. ¡Sigue practicando!</small>
              }
              <button type="button" class="vs__mini" (click)="dejarDeProbar()"><mat-icon>close</mat-icon> Quitármela</button>
            </div>
          } @else {
            <p class="vs__lleva">{{ lleva() }}</p>
            <div class="vs__acciones">
              <button type="button" class="vs__mini" (click)="sorprender()"><mat-icon>casino</mat-icon> Sorpréndeme</button>
              @if (estilo.personalizado()) {
                <button type="button" class="vs__mini" (click)="restablecer()"><mat-icon>restart_alt</mat-icon> Como siempre</button>
              }
            </div>
          }
        </div>

        <div class="vs__panel">
          <div class="vs__pestanas" role="tablist" aria-label="Tipo de prenda">
            @for (t of pestanas; track t.id) {
              <button type="button" role="tab" [id]="'vs-tab-' + t.id" aria-controls="vs-lista"
                      [attr.aria-selected]="pestana() === t.id" (click)="cambiarPestana(t.id)">
                <mat-icon>{{ t.icono }}</mat-icon> {{ t.nombre }}
              </button>
            }
          </div>

          <div class="vs__filtros">
            <span class="vs__conteo">{{ conteo().tiene }} de {{ conteo().total }} en tu colección</span>
            @if (!tienda.docente()) {
              <label class="vs__solo">
                <input type="checkbox" [checked]="soloMias()" (change)="soloMias.set($any($event.target).checked)">
                Solo las que tengo
              </label>
            }
          </div>

          <ul class="vs__lista" id="vs-lista" role="tabpanel" [attr.aria-labelledby]="'vs-tab-' + pestana()">
            @for (p of prendas(); track p.id) {
              @let mia = tiene(p);
              <li>
                <button type="button" class="vs__prenda" [class.vs__prenda--puesta]="puesta(p.id)" [class.vs__prenda--tienda]="!mia"
                        [class.vs__prenda--probando]="probando()?.prenda === p"
                        [attr.aria-pressed]="puesta(p.id)"
                        [title]="mia ? p.descripcion : p.descripcion + ' Cuesta ' + p.precio + ' Sumi Monedas.'"
                        (click)="elegir(p)">
                  @switch (pestana()) {
                    @case ('sombreros') { <app-mascota [tamano]="62" [animada]="false" cara="ninguno" objeto="ninguno" espalda="ninguno" [sombrero]="$any(p.id)" /> }
                    @case ('caras') { <app-mascota [tamano]="62" [animada]="false" sombrero="ninguno" objeto="ninguno" espalda="ninguno" [cara]="$any(p.id)" /> }
                    @case ('objetos') { <app-mascota [tamano]="62" [animada]="false" sombrero="ninguno" cara="ninguno" espalda="ninguno" [objeto]="$any(p.id)" /> }
                    @case ('espaldas') { <app-mascota [tamano]="62" [animada]="false" sombrero="ninguno" cara="ninguno" objeto="ninguno" [espalda]="$any(p.id)" /> }
                    @case ('fondos') { <app-mascota [tamano]="62" [animada]="false" sombrero="ninguno" cara="ninguno" objeto="ninguno" espalda="ninguno" [fondo]="$any(p.id)" /> }
                    @default { <app-mascota [tamano]="62" [animada]="false" sombrero="ninguno" cara="ninguno" objeto="ninguno" espalda="ninguno" [bufanda]="$any(p.id)" /> }
                  }
                  <span class="vs__nombre">{{ p.nombre }}</span>
                  @if (!mia) {
                    <span class="vs__precio" [class.vs__precio--caro]="faltan(p) > 0"><app-moneda-sumi [tamano]="14" /> {{ p.precio }}</span>
                  } @else if (puesta(p.id)) {
                    <span class="vs__puesta"><mat-icon>check_circle</mat-icon> Puesta</span>
                  }
                </button>
              </li>
            }
          </ul>

          <p class="vs__aviso" role="status" aria-live="polite">{{ aviso() }}</p>

          @if (!tienda.docente()) {
            <details class="vs__ayuda" (toggle)="abrirAyuda($event)">
              <summary><app-moneda-sumi [tamano]="18" /> ¿Cómo gano Sumi Monedas?</summary>
              <ul class="vs__reglas">
                @for (r of comoGanar; track r.texto) {
                  <li><mat-icon>{{ r.icono }}</mat-icon> <span>{{ r.texto }}</span> <b>{{ r.monedas }}</b></li>
                }
              </ul>
              @if (movimientos().length) {
                <h3>Tus últimos movimientos</h3>
                <ul class="vs__movs">
                  @for (m of movimientos(); track $index) {
                    <li><span>{{ textoMovimiento(m) }}</span> <b [class.vs__gasto]="m.cantidad < 0">{{ m.cantidad > 0 ? '+' : '' }}{{ m.cantidad }}</b></li>
                  }
                </ul>
              }
            </details>
          }
        </div>
      </div>
    </section>
  `,
})
export class VestidorSumi implements OnInit {
  readonly estilo = inject(EstiloSumiService);
  readonly tienda = inject(TiendaSumiService);
  readonly pestana = signal<Pestana>('sombreros');
  readonly aviso = signal('');
  /** Sumi celebra un momento cada vez que se cambia de estilo. */
  readonly saluda = signal(false);
  readonly probando = signal<Prueba | null>(null);
  readonly comprando = signal(false);
  readonly movimientos = signal<MovimientoMoneda[]>([]);
  readonly comoGanar = COMO_GANAR_MONEDAS;
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  readonly pestanas = PESTANAS;
  /** Ocultar las que no tiene para ver solo lo que ya se puede poner. */
  readonly soloMias = signal(false);
  private readonly infoPestana = computed(() => PESTANAS.find(t => t.id === this.pestana())!);
  readonly prendas = computed(() => this.soloMias()
    ? this.infoPestana().lista.filter(p => this.tiene(p))
    : this.infoPestana().lista);
  readonly conteo = computed(() => ({
    tiene: this.infoPestana().lista.filter(p => this.tiene(p)).length,
    total: this.infoPestana().lista.length,
  }));
  readonly nombreSombrero = computed(() => SOMBREROS.find(s => s.id === this.estilo.sombrero())?.nombre ?? '');
  readonly nombreBufanda = computed(() => 'Bufanda ' + minuscula(BUFANDAS.find(b => b.id === this.estilo.bufanda())?.nombre ?? ''));
  /** Resumen de lo que lleva puesto: "Gorra SAESU · Gafas de sol · Café · Bufanda lila". */
  readonly lleva = computed(() => [
    this.nombreSombrero(),
    this.estilo.cara() === 'ninguno' ? '' : CARAS.find(c => c.id === this.estilo.cara())?.nombre,
    this.estilo.objeto() === 'ninguno' ? '' : OBJETOS.find(o => o.id === this.estilo.objeto())?.nombre,
    this.estilo.espalda() === 'ninguno' ? '' : ESPALDAS.find(e => e.id === this.estilo.espalda())?.nombre,
    this.nombreBufanda(),
    this.estilo.fondo() === 'ninguno' ? '' : 'Fondo ' + minuscula(FONDOS.find(f => f.id === this.estilo.fondo())?.nombre ?? ''),
  ].filter(Boolean).join(' · '));

  ngOnInit(): void {
    if (!this.tienda.cargado()) {
      this.tienda.cargar().subscribe({ error: () => this.aviso.set('No pude traer tus Sumi Monedas. Intenta recargar la página.') });
    }
  }

  tiene(p: PrendaSumi<string>): boolean {
    return this.tienda.tiene(this.infoPestana().categoria, p);
  }

  faltan(p: PrendaSumi<string>): number {
    return Math.max(0, p.precio - this.tienda.monedas());
  }

  puesta(id: string): boolean {
    return this.actual(this.pestana()) === id;
  }

  /** Para la Sumi grande: la prenda que se está probando en esa parte, o null (lo que lleva puesto). */
  prueba(pestana: Pestana): string | null {
    const pr = this.probando();
    return pr?.pestana.id === pestana ? pr.prenda.id : null;
  }

  cambiarPestana(id: Pestana): void {
    this.pestana.set(id);
    this.probando.set(null);
  }

  elegir(p: PrendaSumi<string>): void {
    if (!this.tiene(p)) {
      this.probando.set({ pestana: this.infoPestana(), prenda: p });
      this.aviso.set(this.faltan(p) > 0
        ? `Así se vería «${p.nombre}». Cuesta ${p.precio} Sumi Monedas.`
        : `Así se vería «${p.nombre}». ¿Te la llevas por ${p.precio} Sumi Monedas?`);
      return;
    }
    this.probando.set(null);
    this.poner(this.pestana(), p.id);
    this.aviso.set(this.mensajePuesta(p));
    this.celebrar();
    this.guardar();
  }

  comprar(): void {
    const pr = this.probando();
    if (!pr || this.comprando()) return;
    this.comprando.set(true);
    this.tienda.comprar(pr.pestana.categoria, pr.prenda.id).subscribe({
      next: () => {
        this.comprando.set(false);
        this.probando.set(null);
        this.poner(pr.pestana.id, pr.prenda.id);
        this.guardar();
        this.aviso.set(`¡Compraste «${pr.prenda.nombre}»! Ya es parte de tu colección.`);
        this.celebrar();
        this.movimientos.set([]);
      },
      error: (err) => {
        this.comprando.set(false);
        this.aviso.set(err?.message || 'No se pudo hacer la compra. Intenta de nuevo.');
      }
    });
  }

  dejarDeProbar(): void {
    this.probando.set(null);
    this.aviso.set('');
  }

  /** Combina al azar una prenda de cada parte entre las que ya tiene. */
  sorprender(): void {
    for (const t of PESTANAS) {
      const mias = t.lista.filter(p => this.tienda.tiene(t.categoria, p));
      this.poner(t.id, mias[Math.floor(Math.random() * mias.length)].id);
    }
    this.aviso.set('¡Estilo sorpresa!');
    this.celebrar();
    this.guardar();
  }

  restablecer(): void {
    this.estilo.restablecer();
    this.aviso.set('Sumi volvió a su estilo de siempre.');
    this.guardar();
  }

  /** "Compra en el vestidor: sombrero gorra" → "Compraste «Gorra SAESU»". */
  textoMovimiento(m: MovimientoMoneda): string {
    const compra = /^Compra en el vestidor: (\w+) (\w+)$/.exec(m.motivo);
    if (!compra) return m.motivo;
    const prenda = PESTANAS.find(t => t.categoria === compra[1])?.lista.find(p => p.id === compra[2]);
    return prenda ? `Compraste «${prenda.nombre}»` : m.motivo;
  }

  /** Al abrir la ayuda se traen los últimos movimientos de monedas. */
  abrirAyuda(evento: Event): void {
    if ((evento.target as HTMLDetailsElement).open && !this.movimientos().length) {
      this.tienda.historial().subscribe({ next: m => this.movimientos.set(m.slice(0, 6)), error: () => undefined });
    }
  }

  /** Guarda en el servidor; si lo rechaza, vuelve a lo que el servidor tiene. */
  private guardar(): void {
    this.tienda.vestir().subscribe({
      error: (err) => {
        this.aviso.set(err?.message || 'No se pudo guardar el estilo de Sumi.');
        this.tienda.cargar().subscribe({ error: () => undefined });
      }
    });
  }

  private poner(pestana: Pestana, id: string): void {
    switch (pestana) {
      case 'sombreros': this.estilo.ponerSombrero(id as SombreroSumi); break;
      case 'caras': this.estilo.ponerCara(id as CaraSumi); break;
      case 'objetos': this.estilo.ponerObjeto(id as ObjetoSumi); break;
      case 'espaldas': this.estilo.ponerEspalda(id as EspaldaSumi); break;
      case 'fondos': this.estilo.ponerFondo(id as FondoSumi); break;
      default: this.estilo.ponerBufanda(id as BufandaSumi);
    }
  }

  /** Lo que lleva puesto en una parte. */
  private actual(pestana: Pestana): string {
    switch (pestana) {
      case 'sombreros': return this.estilo.sombrero();
      case 'caras': return this.estilo.cara();
      case 'objetos': return this.estilo.objeto();
      case 'espaldas': return this.estilo.espalda();
      case 'fondos': return this.estilo.fondo();
      default: return this.estilo.bufanda();
    }
  }

  private mensajePuesta(p: PrendaSumi<string>): string {
    const fondo = this.pestana() === 'fondos';
    if (p.id === 'ninguno') {
      return fondo ? 'Listo, sin fondo.' : 'Listo, Sumi se lo quitó.';
    }
    if (fondo) {
      return `¡Sumi se fue a «${p.nombre}»!`;
    }
    return `¡A Sumi le queda genial ${this.pestana() === 'bufandas' ? 'la bufanda ' : ''}«${p.nombre}»!`;
  }

  private celebrar(): void {
    this.saluda.set(true);
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.saluda.set(false), 2200);
  }
}

/** "Índigo SAESU" → "índigo SAESU" (solo la primera letra). */
function minuscula(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}
