import { PuntosSumi } from '../../../../shared/components/puntos-sumi/puntos-sumi';
import { RouterLink } from '@angular/router';
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
import { MatSnackBar } from '@angular/material/snack-bar';

import { PerfilService } from '../../../../core/services/perfil.service';
import { PracticaService } from '../../../practica/services/practica.service';
import { Progreso, TEMAS } from '../../../practica/models/practica.model';
import { esDocente, esEstudiante } from '../../../../shared/utils/rol';
import { LogrosGrid } from '../../../gamificacion/components/logros-grid/logros-grid';
import { Insignia } from '../../../gamificacion/components/insignia/insignia';
import { LogrosService } from '../../../gamificacion/services/logros.service';
import { MiPosicion } from '../../../gamificacion/models/ranking.model';
import { CODIGO_DESARROLLADOR, Logro, RAREZAS, avanceDe, proximosLogros } from '../../../gamificacion/models/logro.model';
import { nivelDe } from '../../../gamificacion/models/ranking.model';
import { MetaSemanalCard } from '../../../practica/components/meta-semanal/meta-semanal';
import { CalendarioActividad } from '../../../practica/components/calendario-actividad/calendario-actividad';
import { AnalisisTemas } from '../../../practica/components/analisis-temas/analisis-temas';
import { RankingService } from '../../../gamificacion/services/ranking.service';
import { Medalla } from '../../../../shared/components/medalla/medalla';
import { SumiDev } from '../../../../shared/components/sumi-dev/sumi-dev';
import { VestidorSumi } from '../../../gamificacion/components/vestidor-sumi/vestidor-sumi';
import { MonedaSumi } from '../../../../shared/components/moneda-sumi/moneda-sumi';
import { TiendaSumiService } from '../../../gamificacion/services/tienda-sumi.service';

/** Misma regla de contraseña que el backend (RegistroRequest / ActualizarPerfilRequest). */
const PASSWORD_SEGURA = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;

/** Límite del backend (spring.servlet.multipart.max-file-size) y de nginx. */
const MAX_FOTO_MB = 10;

/** La nueva contraseña y su confirmación deben coincidir. */
const coincidenValidator: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null =>
  grupo.get('passwordNueva')?.value === grupo.get('confirmar')?.value ? null : { noCoinciden: true };

/**
 * /perfil: datos del usuario y, para estudiantes, su nivel, cifras, meta semanal, calendario de actividad,
 * progreso por tema, fortalezas y debilidades, próximos logros y la colección de logros e insignias especiales.
 * También permite editar el nombre y cambiar la contraseña (PUT /api/auth/perfil).
 */
/** Insignias que caben junto al rol en la cabecera del perfil. */
const MAX_INSIGNIAS_CABECERA = 6;

@Component({
  imports: [MonedaSumi, VestidorSumi, RouterLink, DatePipe, DecimalPipe, ReactiveFormsModule, MatIconModule, LogrosGrid, Insignia, Medalla, PuntosSumi, SumiDev, MetaSemanalCard, CalendarioActividad,
    AnalisisTemas],
  selector: 'app-perfil',
  styleUrl: './perfil.scss',
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {

  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private practicaService = inject(PracticaService);
  private snackBar = inject(MatSnackBar);
  private logrosService = inject(LogrosService);

  readonly usuario = this.perfilService.usuario;
  /** Sumi Monedas (se gastan en el vestidor). */
  readonly tienda = inject(TiendaSumiService);
  readonly iniciales = this.perfilService.iniciales;
  readonly fotoUrl = this.perfilService.fotoUrl;
  subiendoFoto = signal(false);
  readonly temas = TEMAS;

  progreso = signal<Progreso | null>(null);
  guardandoNombre = signal(false);
  guardandoPassword = signal(false);
  mostrarPasswords = signal(false);

  esEstudiante = computed(() => esEstudiante(this.usuario()?.rol));
  private rankingService = inject(RankingService);
  /** Puesto en el ranking (para la medalla del top 3). */
  miLugar = computed(() => this.esEstudiante() ? this.rankingService.lugarDe(this.usuario()?.id) : null);
  esDocente = computed(() => esDocente(this.usuario()?.rol));
  /** Logros (GET /api/logros): los usa la cuadrícula, las cifras y los próximos logros. */
  logros = signal<Logro[]>([]);
  cargandoLogros = signal(true);
  errorLogros = signal(false);
  logrosObtenidos = computed(() => this.logros().filter(l => l.obtenido && l.rareza !== 'EXCLUSIVO').length);
  /** Tiene la insignia exclusiva de desarrollador (solo la reciben los correos configurados en el backend). */
  esDesarrollador = computed(() => this.logros().some(l => l.codigo === CODIGO_DESARROLLADOR && l.obtenido));
  proximos = computed(() => proximosLogros(this.logros(), 3));

  /** Puesto en el ranking histórico aunque no esté en el top 10 (GET /api/ranking/yo). */
  miPosicion = signal<MiPosicion | null>(null);
  puesto = computed(() => this.miLugar() ?? this.miPosicion()?.posicion ?? null);

  /**
   * Insignias que se muestran junto al rol: primero las especiales (retos), luego las más raras.
   * Se ven hasta MAX_INSIGNIAS_CABECERA y el resto como "+N".
   */
  insigniasObtenidas = computed(() => this.logros()
    .filter(l => l.obtenido && l.rareza !== 'EXCLUSIVO')
    .sort((a, b) => Number(b.categoria === 'RETOS') - Number(a.categoria === 'RETOS')
      || RAREZAS[b.rareza].orden - RAREZAS[a.rareza].orden));
  insigniasCabecera = computed(() => this.insigniasObtenidas().slice(0, MAX_INSIGNIAS_CABECERA));
  insigniasRestantes = computed(() => Math.max(0, this.insigniasObtenidas().length - MAX_INSIGNIAS_CABECERA));
  readonly avance = avanceDe;

  /** Nivel según los Puntos Sumi (mismos niveles del ranking). */
  nivel = computed(() => nivelDe(this.usuario()?.puntosTotales ?? 0));

  totalCorrectas = computed(() => {
    const p = this.progreso();
    return p ? p.limites.correctas + p.derivadas.correctas + p.integrales.correctas : 0;
  });

  /** Porcentaje de acierto en todos los temas. */
  precision = computed(() => {
    const p = this.progreso();
    const total = this.totalRespondidas();
    if (!p || !total) return 0;
    return Math.round(((p.limites.correctas + p.derivadas.correctas + p.integrales.correctas) / total) * 100);
  });

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
    this.rankingService.obtenerTop().subscribe({ error: () => {} });
    this.rankingService.miPosicion().subscribe({ next: (p) => this.miPosicion.set(p), error: () => this.miPosicion.set(null) });
    // Solo se muestran a estudiantes; si es docente la respuesta simplemente no se usa
    this.logrosService.listar().subscribe({
      next: (l) => { this.logros.set(l ?? []); this.cargandoLogros.set(false); },
      error: () => { this.cargandoLogros.set(false); this.errorLogros.set(true); }
    });
    this.practicaService.obtenerProgreso().subscribe({
      next: (p) => this.progreso.set(p),
      error: () => this.progreso.set(null) // docentes o error: no se muestra
    });
  }

  /** Baja hasta la colección de logros (sin cambiar la URL). */
  irAColeccion(evento: Event): void {
    evento.preventDefault();
    document.querySelector<HTMLElement>('app-logros-grid')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  /** Cómo va en un tema según lo que ha respondido. */
  estadoTema(respondidas: number, porcentaje: number): string {
    if (!respondidas) return 'Por empezar';
    if (porcentaje >= 80) return 'Excelente';
    if (porcentaje >= 50) return 'Vas bien';
    return 'En camino';
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
