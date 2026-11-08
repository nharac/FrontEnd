import { Component, OnDestroy, effect, inject, model, signal, untracked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGEN_MB = 5;

/**
 * Botón "Foto" para adjuntar una imagen a una respuesta del foro, con su vista previa.
 * Solo elige y valida el archivo; quien lo usa lo sube con ForoService.subirImagen al enviar.
 * Uso: <app-adjuntar-imagen [(archivo)]="archivo" />
 */
@Component({
  selector: 'app-adjuntar-imagen',
  imports: [MatIconModule],
  template: `
    @if (vista(); as src) {
      <span class="adj__vista">
        <img [src]="src" alt="Imagen que vas a adjuntar">
        <button type="button" (click)="archivo.set(null)" aria-label="Quitar imagen" title="Quitar imagen"><mat-icon>close</mat-icon></button>
      </span>
    } @else {
      <label class="adj__boton" title="Adjuntar una foto de tu procedimiento (JPG, PNG, WEBP o GIF, máximo 5 MB)">
        <mat-icon>add_photo_alternate</mat-icon><span>Foto</span>
        <input type="file" class="sr-only" accept="image/png,image/jpeg,image/webp,image/gif" (change)="elegir($event)"
               aria-label="Adjuntar imagen">
      </label>
    }
  `,
})
export class AdjuntarImagen implements OnDestroy {
  readonly archivo = model<File | null>(null);
  readonly vista = signal<string | null>(null);
  private snackBar = inject(MatSnackBar);

  constructor() {
    // La vista previa sigue al archivo (también cuando el padre lo limpia después de enviar)
    effect(() => {
      const a = this.archivo();
      untracked(() => {
        this.liberar();
        this.vista.set(a ? URL.createObjectURL(a) : null);
      });
    });
  }

  elegir(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const a = input.files?.[0] ?? null;
    input.value = '';
    if (!a) return;
    if (!TIPOS_IMAGEN.includes(a.type)) {
      this.snackBar.open('Solo se aceptan imágenes JPG, PNG, WEBP o GIF', 'Cerrar', { duration: 3500 });
      return;
    }
    if (a.size > MAX_IMAGEN_MB * 1024 * 1024) {
      this.snackBar.open(`La imagen no puede pesar más de ${MAX_IMAGEN_MB} MB`, 'Cerrar', { duration: 3500 });
      return;
    }
    this.archivo.set(a);
  }

  ngOnDestroy(): void {
    this.liberar();
  }

  private liberar(): void {
    const v = this.vista();
    if (v) URL.revokeObjectURL(v);
  }
}
