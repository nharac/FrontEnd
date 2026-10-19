import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ForoService } from '../../services/foro.service';
import { CrearPublicacionRequest } from '../../models/foro.model';

/** Límite del backend (CrearPublicacionRequest.titulo). */
const MAX_TITULO = 255;

/**
 * /foro/nueva: formulario para publicar una consulta en el foro.
 * Valida lo mismo que el backend: título (máx. 255), contenido y tema obligatorios.
 */
@Component({
  selector: 'app-nueva-publicacion',
  imports: [RouterLink, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './nueva-publicacion.html',
  styleUrl: './nueva-publicacion.scss',
})
export class NuevaPublicacion {

  private fb = inject(FormBuilder);
  private foroService = inject(ForoService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly maxTitulo = MAX_TITULO;
  readonly temas = [
    { id: 'limites', nombre: 'Límites' },
    { id: 'derivadas', nombre: 'Derivadas' },
    { id: 'integrales', nombre: 'Integrales' },
  ];

  enviando = signal(false);

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(MAX_TITULO)]],
    tema: ['', [Validators.required]],
    contenido: ['', [Validators.required, Validators.minLength(10)]],
  });

  get titulo() { return this.form.controls.titulo; }
  get tema() { return this.form.controls.tema; }
  get contenido() { return this.form.controls.contenido; }

  publicar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const request: CrearPublicacionRequest = {
      titulo: valores.titulo.trim(),
      contenido: valores.contenido.trim(),
      tema: valores.tema as CrearPublicacionRequest['tema'],
    };

    this.enviando.set(true);
    this.foroService.crear(request).subscribe({
      next: (pub) => {
        this.snackBar.open('¡Publicación creada!', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/foro', pub.id]);
      },
      error: (err) => {
        this.enviando.set(false);
        this.snackBar.open(err?.message || 'No se pudo crear la publicación', 'Cerrar', { duration: 4000 });
      }
    });
  }
}
