import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ForoService } from '../../services/foro.service';
import { NOMBRES_TEMA, PublicacionDetalle, Respuesta } from '../../models/foro.model';
import { RespuestaItem } from '../../../../shared/components/respuesta-item/respuesta-item';
import { haceCuanto } from '../../../../shared/utils/tiempo';
import { esDocente } from '../../../../shared/utils/rol';

/**
 * /foro/:id — una publicación con sus respuestas anidadas.
 * El estudiante puede responder la publicación o una respuesta directa,
 * y eliminar la publicación si es el autor.
 */
@Component({
  selector: 'app-ver-publicacion',
  imports: [RouterLink, FormsModule, MatIconModule, MatSnackBarModule, RespuestaItem],
  templateUrl: './ver-publicacion.html',
  styleUrl: './ver-publicacion.scss',
})
export class VerPublicacion implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private foroService = inject(ForoService);
  private snackBar = inject(MatSnackBar);

  publicacion = signal<PublicacionDetalle | null>(null);
  cargando = signal(true);
  error = signal(false);
  texto = signal('');
  enviando = signal(false);
  usuarioId = signal<number | null>(null);
  confirmandoEliminar = signal(false);
  eliminando = signal(false);

  readonly nombresTema = NOMBRES_TEMA;
  readonly haceCuanto = haceCuanto;
  readonly esDocente = esDocente;

  private id = 0;

  esAutor = computed(() => {
    const p = this.publicacion();
    return !!p && this.usuarioId() !== null && p.autor.id === this.usuarioId();
  });
  totalRespuestas = computed(() => this.contar(this.publicacion()?.respuestas ?? []));
  tieneOficial = computed(() => this.hayOficial(this.publicacion()?.respuestas ?? []));

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.foroService.obtenerPerfil().subscribe({
      next: (u) => this.usuarioId.set(u.id),
      error: () => this.usuarioId.set(null)
    });
    this.cargar();
  }

  cargar(): void {
    this.foroService.detalle(this.id).subscribe({
      next: (p) => {
        this.publicacion.set(p);
        this.cargando.set(false);
        this.error.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
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
    this.foroService.responder(this.id, { contenido: texto, respuestaPadreId: padreId }).subscribe({
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

  eliminar(): void {
    this.eliminando.set(true);
    this.foroService.eliminar(this.id).subscribe({
      next: () => {
        this.avisar('Publicación eliminada');
        this.router.navigate(['/foro']);
      },
      error: (err) => {
        this.eliminando.set(false);
        this.confirmandoEliminar.set(false);
        this.avisar(err?.status === 403
          ? 'Solo el autor puede eliminar esta publicación'
          : err?.message || 'No se pudo eliminar la publicación');
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
