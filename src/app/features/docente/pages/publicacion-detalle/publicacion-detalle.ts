import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DocenteService } from '../../services/docente.service';
import { RespuestaItem } from '../../../../shared/components/respuesta-item/respuesta-item';
import { NOMBRES_TEMA, PublicacionDetalle, Respuesta } from '../../../foro/models/foro.model';
import { haceCuanto } from '../../../../shared/utils/tiempo';

/**
 * /docente/publicaciones/:id
 * El docente lee la consulta, revisa las respuestas (anidadas), marca la
 * respuesta oficial y puede responder él mismo.
 */
@Component({
  selector: 'app-publicacion-detalle',
  imports: [RouterLink, FormsModule, MatIconModule, RespuestaItem],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.scss',
})
export class PublicacionDetallePage implements OnInit {

  private route = inject(ActivatedRoute);
  private docenteService = inject(DocenteService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  publicacion = signal<PublicacionDetalle | null>(null);
  cargando = signal(true);
  error = signal(false);
  procesandoId = signal<number | null>(null);
  texto = signal('');
  enviando = signal(false);
  ocultandoPublicacion = signal(false);

  readonly nombresTema = NOMBRES_TEMA;
  readonly haceCuanto = haceCuanto;

  private id = 0;

  totalRespuestas = computed(() => this.contar(this.publicacion()?.respuestas ?? []));
  tieneOficial = computed(() => this.hayOficial(this.publicacion()?.respuestas ?? []));

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  cargar(): void {
    this.docenteService.detallePublicacion(this.id).subscribe({
      next: (p) => {
        this.publicacion.set(p);
        this.cargando.set(false);
        this.error.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(true);
        this.avisar(err?.message || 'No se pudo cargar la publicación');
      }
    });
  }

  marcarOficial(respuestaId: number): void {
    this.procesandoId.set(respuestaId);
    this.docenteService.marcarOficial(respuestaId).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.avisar('Respuesta marcada como oficial');
        this.cargar();
        this.docenteService.refrescarPendientes();
      },
      error: (err) => {
        this.procesandoId.set(null);
        this.avisar(err?.status === 403
          ? 'Solo un docente puede marcar respuestas oficiales'
          : err?.message || 'No se pudo marcar la respuesta');
      }
    });
  }

  quitarOficial(respuestaId: number): void {
    this.procesandoId.set(respuestaId);
    this.docenteService.quitarOficial(respuestaId).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.avisar('Se quitó el estado oficial');
        this.cargar();
        this.docenteService.refrescarPendientes();
      },
      error: (err) => {
        this.procesandoId.set(null);
        this.avisar(err?.message || 'No se pudo quitar el estado oficial');
      }
    });
  }

  /** Moderación: oculta la respuesta y ofrece deshacer. */
  ocultarRespuesta(respuestaId: number): void {
    this.procesandoId.set(respuestaId);
    this.docenteService.ocultarRespuesta(respuestaId).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.cargar();
        this.snackBar.open('Respuesta oculta para los estudiantes', 'Deshacer', { duration: 6000 })
          .onAction().subscribe(() => {
            this.docenteService.restaurarRespuesta(respuestaId).subscribe({
              next: () => { this.avisar('Respuesta restaurada'); this.cargar(); }
            });
          });
      },
      error: (err) => {
        this.procesandoId.set(null);
        this.avisar(err?.message || 'No se pudo ocultar la respuesta');
      }
    });
  }

  /** Moderación: oculta toda la publicación y vuelve al foro (con opción de deshacer). */
  ocultarPublicacion(): void {
    this.ocultandoPublicacion.set(true);
    this.docenteService.ocultarPublicacion(this.id).subscribe({
      next: () => {
        this.ocultandoPublicacion.set(false);
        const id = this.id;
        void this.router.navigate(['/docente/foro']);
        this.snackBar.open('Publicación oculta. La encuentras en Moderación.', 'Deshacer', { duration: 6000 })
          .onAction().subscribe(() => {
            this.docenteService.restaurarPublicacion(id).subscribe({
              next: () => {
                this.avisar('Publicación restaurada');
                void this.router.navigate(['/docente/publicaciones', id]);
              }
            });
          });
      },
      error: (err) => {
        this.ocultandoPublicacion.set(false);
        this.avisar(err?.message || 'No se pudo ocultar la publicación');
      }
    });
  }

  /** Respuesta directa a la publicación (padreId = null) o a una respuesta. */
  responder(contenido: string, padreId: number | null = null): void {
    const texto = contenido.trim();
    if (!texto || this.enviando()) {
      return;
    }
    this.enviando.set(true);
    this.docenteService.responder(this.id, { contenido: texto, respuestaPadreId: padreId }).subscribe({
      next: () => {
        this.enviando.set(false);
        if (padreId === null) {
          this.texto.set('');
        }
        this.avisar('Respuesta publicada');
        this.cargar();
      },
      error: (err) => {
        this.enviando.set(false);
        this.avisar(err?.message || 'No se pudo publicar la respuesta');
      }
    });
  }

  private contar(lista: Respuesta[]): number {
    return lista.reduce((total, r) => total + 1 + this.contar(r.respuestasHijas ?? []), 0);
  }

  private hayOficial(lista: Respuesta[]): boolean {
    return lista.some(r => r.esOficial || this.hayOficial(r.respuestasHijas ?? []));
  }

  private avisar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
