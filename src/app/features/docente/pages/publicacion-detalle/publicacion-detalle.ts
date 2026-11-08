import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ForoService } from '../../../foro/services/foro.service';
import { DocenteService } from '../../services/docente.service';
import { RespuestaItem } from '../../../../shared/components/respuesta-item/respuesta-item';
import { NOMBRES_TEMA, PublicacionDetalle, Respuesta } from '../../../foro/models/foro.model';
import { haceCuanto } from '../../../../shared/utils/tiempo';

/**
 * /docente/publicaciones/:id
 * El docente lee la consulta, revisa las respuestas (anidadas), marca la
 * respuesta oficial y puede responder él mismo.
 */
import { UtilesService } from '../../../foro/services/utiles.service';
import { AdjuntarImagen } from '../../../../shared/components/adjuntar-imagen/adjuntar-imagen';
import { Observable, map, of, switchMap } from 'rxjs';
import { Verificado } from '../../../../shared/components/verificado/verificado';
@Component({
  selector: 'app-publicacion-detalle',
  imports: [Verificado, RouterLink, FormsModule, MatIconModule, RespuestaItem, AdjuntarImagen],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.scss',
})
export class PublicacionDetallePage implements OnInit {
  private utilesService = inject(UtilesService);

  private route = inject(ActivatedRoute);
  private docenteService = inject(DocenteService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private foroService = inject(ForoService);

  publicacion = signal<PublicacionDetalle | null>(null);
  cargando = signal(true);
  error = signal(false);
  procesandoId = signal<number | null>(null);
  texto = signal('');
  /** Foto para adjuntar a la respuesta. */
  archivo = signal<File | null>(null);
  enviando = signal(false);
  ocultandoPublicacion = signal(false);
  confirmandoEliminar = signal(false);
  eliminando = signal(false);

  readonly nombresTema = NOMBRES_TEMA;
  readonly haceCuanto = haceCuanto;

  private id = 0;

  totalRespuestas = computed(() => this.contar(this.publicacion()?.respuestas ?? []));
  tieneOficial = computed(() => this.hayOficial(this.publicacion()?.respuestas ?? []));

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
    this.utilesService.cargar(this.id);
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
  /** Elimina la publicación del foro (a diferencia de ocultar, no se restaura desde Moderación). */
  eliminarPublicacion(): void {
    this.eliminando.set(true);
    this.foroService.eliminar(this.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.confirmandoEliminar.set(false);
        this.docenteService.refrescarPendientes();
        this.avisar('Publicación eliminada del foro');
        void this.router.navigate(['/docente/foro']);
      },
      error: (err) => {
        this.eliminando.set(false);
        this.avisar(err?.message || 'No se pudo eliminar la publicación');
      }
    });
  }

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
  responder(contenido: string, padreId: number | null = null, archivo: File | null = null): void {
    const texto = contenido.trim();
    if (!texto || this.enviando()) {
      return;
    }
    this.enviando.set(true);
    const imagenUrl$: Observable<string | null> = archivo
      ? this.foroService.subirImagen(archivo).pipe(map(r => r.url))
      : of(null);
    imagenUrl$.pipe(
      switchMap(imagenUrl => this.docenteService.responder(this.id, { contenido: texto, respuestaPadreId: padreId, imagenUrl }))
    ).subscribe({
      next: () => {
        this.enviando.set(false);
        if (padreId === null) {
          this.texto.set('');
          this.archivo.set(null);
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
