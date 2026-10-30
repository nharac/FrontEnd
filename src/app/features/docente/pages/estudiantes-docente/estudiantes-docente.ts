import { SumiDice } from '../../../../shared/components/sumi-dice/sumi-dice';
import { mensajeEstudiantes } from '../../../../shared/components/sumi-dice/dialogos';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DocenteService } from '../../services/docente.service';
import { EstudianteResumen } from '../../models/docente.model';
import { NOMBRES_TEMA } from '../../../foro/models/foro.model';
import { haceCuanto } from '../../../../shared/utils/tiempo';
import { colorPorcentaje, iniciales } from '../../utils/colores';

type Filtro = 'todos' | 'riesgo' | 'aldia' | 'nuevos';
type Orden = 'nombre' | 'puntos' | 'porcentaje' | 'ultima' | 'quiz';

/**
 * /docente/estudiantes
 * Tabla con el progreso de cada estudiante. Marca "En riesgo" a quien lleva más de
 * 7 días sin practicar o acierta menos del 50 % (con al menos 5 intentos).
 * Se puede descargar en Excel (.xlsx) con formato y una hoja de resumen.
 */
@Component({
  selector: 'app-estudiantes-docente',
  imports: [RouterLink, FormsModule, MatIconModule, MatTooltipModule, DecimalPipe, SumiDice],
  templateUrl: './estudiantes-docente.html',
  styleUrl: './estudiantes-docente.scss',
})
export class EstudiantesDocente implements OnInit {

  private docenteService = inject(DocenteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  estudiantes = signal<EstudianteResumen[]>([]);
  cargando = signal(true);
  error = signal(false);
  exportando = signal(false);

  busqueda = signal('');
  filtro = signal<Filtro>('todos');
  orden = signal<Orden>('nombre');
  descendente = signal(false);

  readonly temas = ['limites', 'derivadas', 'integrales'] as const;
  readonly nombresTema = NOMBRES_TEMA;
  readonly haceCuanto = haceCuanto;
  readonly iniciales = iniciales;
  readonly color = colorPorcentaje;

  enRiesgo = computed(() => this.estudiantes().filter(e => e.estado === 'en-riesgo').length);
  nuevos = computed(() => this.estudiantes().filter(e => e.estado === 'nuevo').length);
  sumiEstudiantes = computed(() => mensajeEstudiantes(this.enRiesgo(), this.nuevos()));

  visibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const filtro = this.filtro();
    const lista = this.estudiantes().filter(e =>
      (filtro === 'todos'
        || (filtro === 'riesgo' && e.estado === 'en-riesgo')
        || (filtro === 'aldia' && e.estado === 'al-dia')
        || (filtro === 'nuevos' && e.estado === 'nuevo')) &&
      (!texto || e.nombre.toLowerCase().includes(texto) || e.correo.toLowerCase().includes(texto)));

    const signo = this.descendente() ? -1 : 1;
    const clave = this.orden();
    return [...lista].sort((a, b) => {
      switch (clave) {
        case 'puntos': return signo * (a.puntos - b.puntos);
        case 'porcentaje': return signo * (a.porcentaje - b.porcentaje);
        case 'quiz': return signo * ((a.promedioQuiz ?? -1) - (b.promedioQuiz ?? -1));
        case 'ultima': return signo * (tiempo(a.ultimaActividad) - tiempo(b.ultimaActividad));
        default: return signo * a.nombre.localeCompare(b.nombre, 'es');
      }
    });
  });

  ngOnInit(): void {
    const f = this.route.snapshot.queryParamMap.get('filtro');
    if (f === 'riesgo' || f === 'aldia') {
      this.filtro.set(f);
    }
    this.docenteService.estudiantes().subscribe({
      next: (lista) => {
        this.estudiantes.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      }
    });
  }

  cambiarFiltro(f: Filtro): void {
    this.filtro.set(f);
    void this.router.navigate([], { queryParams: { filtro: f === 'todos' ? null : f }, replaceUrl: true });
  }

  ordenarPor(clave: Orden): void {
    if (this.orden() === clave) {
      this.descendente.update(v => !v);
    } else {
      this.orden.set(clave);
      // Lo más útil primero: más puntos, más aciertos, actividad más reciente
      this.descendente.set(clave !== 'nombre');
    }
  }

  iconoOrden(clave: Orden): string {
    if (this.orden() !== clave) return 'unfold_more';
    return this.descendente() ? 'arrow_downward' : 'arrow_upward';
  }

  abrir(e: EstudianteResumen): void {
    void this.router.navigate(['/docente/estudiantes', e.id]);
  }

  temaDe(e: EstudianteResumen, tema: string) {
    return e.porTema.find(t => t.tema === tema);
  }

  exportar(): void {
    if (this.exportando()) return;
    this.exportando.set(true);
    this.docenteService.exportarEstudiantes().subscribe({
      next: (blob) => {
        const archivo = `progreso-estudiantes-${new Date().toLocaleDateString('en-CA')}.xlsx`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = archivo;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.exportando.set(false);
        const n = this.estudiantes().length;
        this.snackBar.open(
          `Incluye ${n} ${n === 1 ? 'estudiante' : 'estudiantes'} y una hoja con el resumen del grupo.`, 'Cerrar',
          { duration: 6000, data: { titulo: 'Excel descargado', icono: 'table_view', tipo: 'exito', archivo } });
      },
      error: () => {
        this.exportando.set(false);
        this.snackBar.open('Revisa tu conexión e inténtalo de nuevo.', 'Cerrar',
          { duration: 5000, data: { titulo: 'No se pudo descargar el Excel', tipo: 'error' } });
      }
    });
  }
}

function tiempo(fecha: string | null): number {
  return fecha ? new Date(fecha).getTime() : 0;
}
