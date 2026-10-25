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
import { Rol } from '../../models/rol.enum';

/** Misma regla de contraseña que el backend (RegistroRequest / ActualizarPerfilRequest). */
const PASSWORD_SEGURA = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;

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
  readonly temas = TEMAS;

  progreso = signal<Progreso | null>(null);
  guardandoNombre = signal(false);
  guardandoPassword = signal(false);
  mostrarPasswords = signal(false);

  esEstudiante = computed(() => this.usuario()?.rol === Rol.ESTUDIANTE);
  esDocente = computed(() => this.usuario()?.rol === Rol.DOCENTE);
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

  private avisar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3500 });
  }
}
