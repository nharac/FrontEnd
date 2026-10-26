import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PerfilService } from '../../../../core/services/perfil.service';
import { PracticaService } from '../../../practica/services/practica.service';
import { Progreso, TEMAS } from '../../../practica/models/practica.model';
import { esDocente, esEstudiante } from '../../../../shared/utils/rol';

/** Misma regla de contraseña que el backend (RegistroRequest / ActualizarPerfilRequest). */
const PASSWORD_SEGURA = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;

/** Límite del backend (spring.servlet.multipart.max-file-size) y de nginx. */
const MAX_FOTO_MB = 10;

/** La nueva contraseña y su confirmación deben coincidir. */
const coincidenValidator: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null =>
  grupo.get('passwordNueva')?.value === grupo.get('confirmar')?.value ? null : { noCoinciden: true };

/**
 * /perfil: datos del usuario, progreso por tema (estudiantes),
 * edición del nombre y cambio de contraseña (PUT /api/auth/perfil).
 */
@Component({
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, MatIconModule, MatSnackBarModule],
  selector: 'app-perfil',
  styleUrl: './perfil.scss',
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {

  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private practicaService = inject(PracticaService);
  private snackBar = inject(MatSnackBar);

  readonly usuario = this.perfilService.usuario;
  readonly iniciales = this.perfilService.iniciales;
  readonly fotoUrl = this.perfilService.fotoUrl;
  subiendoFoto = signal(false);
  readonly temas = TEMAS;

  progreso = signal<Progreso | null>(null);
  guardandoNombre = signal(false);
  guardandoPassword = signal(false);
  mostrarPasswords = signal(false);

  esEstudiante = computed(() => esEstudiante(this.usuario()?.rol));
  esDocente = computed(() => esDocente(this.usuario()?.rol));
  totalRespondidas = computed(() => {
    const p = this.progreso();
    return p ? p.limites.respondidas + p.derivadas.respondidas + p.integrales.respondidas : 0;
  });

  formNombre = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
  });

  formPassword = this.fb.nonNullable.group({
    passwordActual: ['', [Validators.required]],
    passwordNueva: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_SEGURA)]],
    confirmar: ['', [Validators.required]],
  }, { validators: coincidenValidator });

  constructor() {
    // Cuando llega el perfil, se llena el formulario del nombre
    effect(() => {
      const u = this.usuario();
      if (u && !this.formNombre.dirty) {
        this.formNombre.setValue({ nombre: u.nombre });
      }
    });
  }

  ngOnInit(): void {
    this.perfilService.cargar(true);
    this.practicaService.obtenerProgreso().subscribe({
      next: (p) => this.progreso.set(p),
      error: () => this.progreso.set(null) // docentes o error: no se muestra
    });
  }

  guardarNombre(): void {
    if (this.formNombre.invalid) {
      this.formNombre.markAllAsTouched();
      return;
    }
    const nombre = this.formNombre.getRawValue().nombre.trim();
    if (nombre === this.usuario()?.nombre) {
      this.avisar('No hay cambios en el nombre');
      return;
    }

    this.guardandoNombre.set(true);
    this.perfilService.actualizar({ nombre }).subscribe({
      next: () => {
        this.guardandoNombre.set(false);
        this.formNombre.markAsPristine();
        this.avisar('Nombre actualizado');
      },
      error: (err) => {
        this.guardandoNombre.set(false);
        this.avisar(err?.message || 'No se pudo actualizar el nombre');
      }
    });
  }

  cambiarPassword(): void {
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }
    const { passwordActual, passwordNueva } = this.formPassword.getRawValue();
    const nombre = this.usuario()?.nombre ?? this.formNombre.getRawValue().nombre;

    this.guardandoPassword.set(true);
    this.perfilService.actualizar({ nombre, passwordActual, passwordNueva }).subscribe({
      next: () => {
        this.guardandoPassword.set(false);
        this.formPassword.reset();
        this.avisar('Contraseña actualizada');
      },
      error: (err) => {
        this.guardandoPassword.set(false);
        this.avisar(err?.message || 'No se pudo cambiar la contraseña');
      }
    });
  }

  /** Valida la imagen elegida y la sube a S3 (POST /api/perfil/foto). */
  elegirFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo) {
      return;
    }
    if (!archivo.type.startsWith('image/')) {
      this.avisar('El archivo debe ser una imagen (JPG, PNG, WEBP o GIF)');
      return;
    }
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
      this.avisar(`La imagen no puede pesar más de ${MAX_FOTO_MB} MB`);
      return;
    }

    this.subiendoFoto.set(true);
    this.perfilService.subirFoto(archivo).subscribe({
      next: () => {
        this.subiendoFoto.set(false);
        this.avisar('Foto de perfil actualizada');
      },
      error: (err) => {
        this.subiendoFoto.set(false);
        this.avisar(err?.status === 413
          ? `La imagen es muy pesada (máximo ${MAX_FOTO_MB} MB)`
          : err?.message || 'No se pudo subir la foto');
      }
    });
  }

  private avisar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3500 });
  }
}
