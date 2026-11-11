import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { PracticaService } from '../../services/practica.service';
import { Opcion, RetoDiario } from '../../models/practica.model';
import { TiendaSumiService } from '../../../gamificacion/services/tienda-sumi.service';
import { Mascota } from '../../../../shared/components/mascota/mascota';
import { Confeti } from '../../../../shared/components/confeti/confeti';
import { PuntosSumi } from '../../../../shared/components/puntos-sumi/puntos-sumi';

const TEMAS: Record<string, string> = { limites: 'Límites', derivadas: 'Derivadas', integrales: 'Integrales' };
const NIVELES: Record<string, string> = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };

/**
 * Reto del día: la misma pregunta para todos ese día y UNA sola oportunidad.
 * El servidor guarda la respuesta: acertar da 30 Puntos Sumi; fallar pierde el reto hasta mañana.
 */
@Component({
  selector: 'app-reto-dia',
  imports: [MatIconModule, Mascota, Confeti, PuntosSumi],
  template: `
    @if (reto(); as r) {
      <section class="reto" [class.reto--hecho]="r.estado === 'ganado'" [class.reto--perdido]="r.estado === 'perdido'">
        @if (celebrar()) { <app-confeti [cantidad]="30" [alcance]="200" /> }
        <header class="reto__cabecera">
          <app-mascota [estado]="sumi()" [accesorio]="r.estado === 'ganado' ? 'trofeo' : r.estado === 'perdido' ? 'libro' : 'lapiz'" [tamano]="58" />
          <div>
            <span class="reto__etiqueta"><mat-icon>local_fire_department</mat-icon> Reto del día</span>
            <h2>{{ titulo() }}</h2>
            <small>{{ nombreTema() }} · {{ nivel() }} · <app-puntos-sumi [tamano]="14" /> +{{ r.puntos }} Puntos Sumi</small>
          </div>
          @if (!abierto() && r.estado === 'pendiente') {
            <button type="button" class="reto__btn" (click)="abierto.set(true)"><mat-icon>play_arrow</mat-icon> Aceptar reto</button>
          }
          @if (r.estado !== 'pendiente' && !abierto()) {
            <button type="button" class="reto__ver" (click)="abierto.set(true)">Ver respuesta</button>
          }
        </header>

        @if (abierto()) {
          <div class="reto__cuerpo">
            @if (r.estado === 'pendiente') {
              <p class="reto__aviso" role="note"><mat-icon>error_outline</mat-icon>
                <span>Solo tienes <b>una oportunidad</b>: si fallas, pierdes el reto de hoy.</span></p>
            }
            <p class="reto__enunciado">{{ r.pregunta.enunciado }}</p>
            <div class="reto__opciones" role="radiogroup" aria-label="Opciones del reto">
              @for (o of r.pregunta.opciones; track o.id) {
                <button type="button" role="radio" class="pc-opcion pc-opcion--{{ estadoOpcion(o) }}"
                        [attr.aria-checked]="elegida() === o.id" [disabled]="r.estado !== 'pendiente' || enviando()"
                        (click)="elegida.set(o.id)">
                  <span class="pc-opcion__letra">{{ o.letra }}</span>
                  <span class="pc-opcion__texto">{{ o.texto }}</span>
                  @switch (estadoOpcion(o)) {
                    @case ('correcta') { <mat-icon class="pc-opcion__icono">check_circle</mat-icon> }
                    @case ('incorrecta') { <mat-icon class="pc-opcion__icono">cancel</mat-icon> }
                    @case ('seleccionada') { <mat-icon class="pc-opcion__icono">radio_button_checked</mat-icon> }
                  }
                </button>
              }
            </div>

            @if (r.estado === 'pendiente') {
              <div class="reto__acciones">
                @if (error()) { <span class="reto__error" role="alert">{{ error() }}</span> }
                <button type="button" class="reto__ver" (click)="cerrar()">Ahora no</button>
                <button type="button" class="reto__btn" [disabled]="elegida() === null || enviando()" (click)="responder()">
                  <mat-icon>lock</mat-icon> {{ enviando() ? 'Enviando…' : 'Responder (sin vuelta atrás)' }}
                </button>
              </div>
            } @else {
              <div class="reto__resultado" role="status">
                @if (r.estado === 'ganado') {
                  <strong>¡Correcto! Ganaste +{{ r.puntos }} Puntos Sumi.</strong>
                } @else {
                  <strong>Esta vez no fue. Perdiste el reto de hoy.</strong>
                  <span>La respuesta correcta era la <b>{{ letraCorrecta() }}</b>. Mañana tienes otra oportunidad.</span>
                }
                @if (r.pista) { <span class="reto__pista"><mat-icon>tips_and_updates</mat-icon> {{ r.pista }}</span> }
              </div>
            }
          </div>
        }
      </section>
    }
  `,
})
export class RetoDia implements OnInit {
  private practica = inject(PracticaService);
  private tienda = inject(TiendaSumiService);

  reto = signal<RetoDiario | null>(null);
  abierto = signal(false);
  elegida = signal<number | null>(null);
  enviando = signal(false);
  celebrar = signal(false);
  error = signal('');

  nombreTema = computed(() => TEMAS[this.reto()?.pregunta.tema ?? ''] ?? '');
  nivel = computed(() => NIVELES[this.reto()?.pregunta.dificultad ?? ''] ?? '');

  titulo = computed(() => ({
    pendiente: 'Una pregunta al día y una sola oportunidad. ¿Te atreves?',
    ganado: '¡Reto superado! Vuelve mañana por otro',
    perdido: 'Perdiste el reto de hoy. Mañana hay revancha',
  })[this.reto()?.estado ?? 'pendiente']);

  sumi = computed(() => ({ pendiente: 'pensando', ganado: 'celebra', perdido: 'animo' } as const)[this.reto()?.estado ?? 'pendiente']);

  letraCorrecta = computed(() => {
    const r = this.reto();
    return r?.pregunta.opciones.find(o => o.id === r.opcionCorrecta)?.letra ?? '';
  });

  ngOnInit(): void {
    this.practica.retoDeHoy().subscribe({ next: (r) => this.reto.set(r), error: () => this.reto.set(null) });
  }

  estadoOpcion(o: Opcion): 'correcta' | 'incorrecta' | 'seleccionada' | 'normal' {
    const r = this.reto();
    if (r && r.estado !== 'pendiente') {
      if (o.id === r.opcionCorrecta) return 'correcta';
      return o.id === r.opcionElegida ? 'incorrecta' : 'normal';
    }
    return this.elegida() === o.id ? 'seleccionada' : 'normal';
  }

  cerrar(): void {
    this.abierto.set(false);
    this.elegida.set(null);
  }

  responder(): void {
    const opcion = this.elegida();
    if (opcion === null || this.enviando()) return;
    this.enviando.set(true);
    this.error.set('');
    this.practica.responderReto(opcion).subscribe({
      next: (r) => {
        this.enviando.set(false);
        this.reto.set(r);
        if (r.estado === 'ganado') {
          this.celebrar.set(true);
          // Las Sumi Monedas que vienen con los puntos
          this.tienda.cargar().subscribe({ error: () => {} });
        }
      },
      error: (e) => {
        this.enviando.set(false);
        if (e?.status === 409) {
          // Ya lo había respondido (otra pestaña): se muestra cómo quedó
          this.practica.retoDeHoy().subscribe({ next: (r) => this.reto.set(r), error: () => {} });
        } else {
          this.error.set('No se pudo enviar. Revisa tu conexión e inténtalo otra vez.');
        }
      }
    });
  }
}
