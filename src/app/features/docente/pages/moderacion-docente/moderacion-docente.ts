import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DocenteService } from '../../services/docente.service';
import { ContenidoOculto } from '../../models/docente.model';
import { haceCuanto } from '../../../../shared/utils/tiempo';

/**
 * /docente/moderacion
 * Publicaciones y respuestas del foro que un docente ocultó. Desde aquí se restauran.
 */
@Component({
  selector: 'app-moderacion-docente',
  imports: [RouterLink, MatIconModule, MatSnackBarModule],
  templateUrl: './moderacion-docente.html',
  styleUrl: './moderacion-docente.scss',
})
export class ModeracionDocente implements OnInit {

  private docenteService = inject(DocenteService);
  private snackBar = inject(MatSnackBar);

  items = signal<ContenidoOculto[]>([]);
  cargando = signal(true);
  error = signal(false);
  procesando = signal<string | null>(null);

  readonly haceCuanto = haceCuanto;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.docenteService.contenidoOculto().subscribe({
      next: (lista) => {
        this.items.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      }
    });
  }

  clave(i: ContenidoOculto): string {
    return i.tipo + '-' + i.id;
  }

  restaurar(i: ContenidoOculto): void {
    this.procesando.set(this.clave(i));
    const peticion = i.tipo === 'PUBLICACION'
      ? this.docenteService.restaurarPublicacion(i.id)
      : this.docenteService.restaurarRespuesta(i.id);
    peticion.subscribe({
      next: () => {
        this.procesando.set(null);
        this.items.update(lista => lista.filter(x => this.clave(x) !== this.clave(i)));
        this.docenteService.refrescarPendientes();
        this.snackBar.open(i.tipo === 'PUBLICACION' ? 'Publicación restaurada' : 'Respuesta restaurada', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.procesando.set(null);
        this.snackBar.open(err?.message || 'No se pudo restaurar', 'Cerrar', { duration: 3500 });
      }
    });
  }
}
