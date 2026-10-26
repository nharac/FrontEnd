import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ForoService } from '../../services/foro.service';
import { CrearPublicacionRequest } from '../../models/foro.model';

/** Límite de StorageService en el backend. */
const MAX_IMAGEN_MB = 5;
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
export class NuevaPublicacion implements OnDestroy {

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
  /** Imagen elegida (se sube a S3 al publicar). */
  archivo = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  arrastrando = signal(false);

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(MAX_TITULO)]],
    tema: ['', [Validators.required]],
    contenido: ['', [Validators.required, Validators.minLength(10)]],
  });

  get titulo() { return this.form.controls.titulo; }
  get tema() { return this.form.controls.tema; }
  get contenido() { return this.form.controls.contenido; }

  elegirImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.usarImagen(input.files?.[0] ?? null);
    input.value = '';
  }

  soltarImagen(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(false);
    this.usarImagen(evento.dataTransfer?.files?.[0] ?? null);
  }

  quitarImagen(): void {
    this.liberarVistaPrevia();
    this.archivo.set(null);
  }

  ngOnDestroy(): void {
    this.liberarVistaPrevia();
  }

  private usarImagen(archivo: File | null): void {
    if (!archivo) return;
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      this.snackBar.open('La imagen debe ser JPG, PNG, WEBP o GIF', 'Cerrar', { duration: 3500 });
      return;
    }
    if (archivo.size > MAX_IMAGEN_MB * 1024 * 1024) {
      this.snackBar.open(`La imagen no puede pesar más de ${MAX_IMAGEN_MB} MB`, 'Cerrar', { duration: 3500 });
      return;
    }
    this.liberarVistaPrevia();
    this.archivo.set(archivo);
    this.vistaPrevia.set(URL.createObjectURL(archivo));
  }

  private liberarVistaPrevia(): void {
    const actual = this.vistaPrevia();
    if (actual) URL.revokeObjectURL(actual);
    this.vistaPrevia.set(null);
  }

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
    // 1. Si hay imagen, primero se sube a S3; 2. luego se crea la publicación con su URL
    const archivo = this.archivo();
    const imagenUrl$: Observable<string | null> = archivo
      ? this.foroService.subirImagen(archivo).pipe(map(res => res.url))
      : of(null);

    imagenUrl$.pipe(
      switchMap(imagenUrl => this.foroService.crear({ ...request, imagenUrl }))
    ).subscribe({
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
