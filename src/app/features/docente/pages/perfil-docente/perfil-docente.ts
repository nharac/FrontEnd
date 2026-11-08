import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PerfilService } from '../../../../core/services/perfil.service';
import { DocenteService } from '../../services/docente.service';
import { EstadisticasGrupo } from '../../models/docente.model';
import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';
import { OjoPassword } from '../../../../shared/components/ojo-password/ojo-password';
import { FuerzaPassword } from '../../../../shared/components/fuerza-password/fuerza-password';
import { reglasPassword } from '../../../../shared/utils/password';

const MAX_FOTO_MB = 10;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/**
 * /docente/perfil — la cuenta del docente: foto, nombre, contraseña y un resumen de su grupo.
 * Usa los mismos endpoints que el perfil del estudiante (PUT /api/auth/perfil y POST /api/perfil/foto).
 */
@Component({
  selector: 'app-perfil-docente',
  imports: [RouterLink, FormsModule, MatIconModule, SumiDice, OjoPassword, FuerzaPassword],
  templateUrl: './perfil-docente.html',
})
export class PerfilDocente implements OnInit {

  private perfilService = inject(PerfilService);
  private docenteService = inject(DocenteService);
  private snackBar = inject(MatSnackBar);

  readonly usuario = this.perfilService.usuario;
  readonly iniciales = this.perfilService.iniciales;
  readonly foto = this.perfilService.fotoUrl;

  grupo = signal<EstadisticasGrupo | null>(null);
  pendientes = this.docenteService.pendientes;

  nombre = signal('');
  guardandoNombre = signal(false);
  subiendoFoto = signal(false);

  passwordActual = signal('');
  passwordNueva = signal('');
  confirmar = signal('');
  verActual = signal(false);
  verNueva = signal(false);
  guardandoPassword = signal(false);

  /** "Docente desde octubre de 2026" */
  desde = computed(() => {
    const f = this.usuario()?.fechaRegistro;
    if (!f) return '';
    const d = new Date(f);
    return `Docente desde ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
  });

  nombreCambio = computed(() => {
    const n = this.nombre().trim();
    return n.length >= 3 && n !== (this.usuario()?.nombre ?? '');
  });
  passwordValida = computed(() => reglasPassword(this.passwordNueva()).every(r => r.ok));
  coinciden = computed(() => !!this.confirmar() && this.confirmar() === this.passwordNueva());
  puedeCambiarPassword = computed(() => !!this.passwordActual() && this.passwordValida() && this.coinciden());

  constructor() {
    // El campo del nombre empieza con el nombre actual (cuando el perfil termina de cargar)
    effect(() => {
      const u = this.usuario();
      if (u && !untracked(this.nombre)) this.nombre.set(u.nombre);
    });
  }

  ngOnInit(): void {
    this.perfilService.cargar();
    this.docenteService.refrescarPendientes();
    this.docenteService.estadisticas().subscribe({
      next: g => this.grupo.set(g),
      error: () => this.grupo.set(null)
    });
  }

  guardarNombre(): void {
    if (!this.nombreCambio()) return;
    this.guardandoNombre.set(true);
    this.perfilService.actualizar({ nombre: this.nombre().trim() }).subscribe({
      next: () => {
        this.guardandoNombre.set(false);
        this.docenteService.limpiarCache(); // el inicio vuelve a pedir el nombre
        this.avisar('Nombre actualizado');
      },
      error: (err) => {
        this.guardandoNombre.set(false);
        this.avisar(err?.message || 'No se pudo actualizar el nombre');
      }
    });
  }

  cambiarPassword(): void {
    if (!this.puedeCambiarPassword()) return;
    this.guardandoPassword.set(true);
    this.perfilService.actualizar({
      nombre: this.usuario()?.nombre ?? this.nombre().trim(),
      passwordActual: this.passwordActual(),
      passwordNueva: this.passwordNueva()
    }).subscribe({
      next: () => {
        this.guardandoPassword.set(false);
        this.passwordActual.set('');
        this.passwordNueva.set('');
        this.confirmar.set('');
        this.avisar('Contraseña actualizada. Te enviamos un correo de aviso.');
      },
      error: (err) => {
        this.guardandoPassword.set(false);
        this.avisar(err?.message || 'No se pudo cambiar la contraseña');
      }
    });
  }

  /** Valida la imagen elegida y la sube (POST /api/perfil/foto). */
  elegirFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
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
        this.avisar(err?.message || 'No se pudo subir la foto');
      }
    });
  }

  private avisar(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3500 });
  }
}
