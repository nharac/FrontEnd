import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ForoService } from '../../services/foro.service';
import { NOMBRES_TEMA, OrdenForo, PublicacionResumen } from '../../models/foro.model';
import { haceCuanto } from '../../../../shared/utils/tiempo';

/** Publicaciones por página (el backend pagina con page/size). */
const TAMANO_PAGINA = 10;

/**
 * /foro: lista de publicaciones del foro colaborativo.
 * Búsqueda, filtro por tema, orden y "Cargar más".
 */
@Component({
  imports: [RouterLink, FormsModule, MatIconModule, MatSnackBarModule],
  selector: 'app-lista-publicaciones',
  styleUrl: './lista-publicaciones.scss',
  templateUrl: './lista-publicaciones.html',
})
export class ListaPublicaciones implements OnInit {

  private foroService = inject(ForoService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  publicaciones = signal<PublicacionResumen[]>([]);
  cargando = signal(true);
  cargandoMas = signal(false);
  hayMas = signal(false);

  busqueda = signal('');
  tema = signal<string | null>(null);
  orden = signal<OrdenForo>('reciente');

  readonly temas = [
    { id: null, nombre: 'Todos' },
    { id: 'limites', nombre: 'Límites' },
    { id: 'derivadas', nombre: 'Derivadas' },
    { id: 'integrales', nombre: 'Integrales' },
  ];
  readonly ordenes: { id: OrdenForo; nombre: string }[] = [
    { id: 'reciente', nombre: 'Más recientes' },
    { id: 'antiguo', nombre: 'Más antiguas' },
    { id: 'respuestas', nombre: 'Más respondidas' },
  ];
  readonly nombresTema = NOMBRES_TEMA;
  readonly haceCuanto = haceCuanto;

  private pagina = 0;

  ngOnInit(): void {
    this.cargar();
  }

  elegirTema(tema: string | null): void {
    this.tema.set(tema);
    this.cargar();
  }

  cambiarOrden(orden: OrdenForo): void {
    this.orden.set(orden);
    this.cargar();
  }

  buscar(): void {
    this.cargar();
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
    this.cargar();
  }

  /** Vuelve a la primera página con los filtros actuales. */
  cargar(): void {
    this.pagina = 0;
    this.cargando.set(true);
    this.pedirPagina(lista => this.publicaciones.set(lista));
  }

  cargarMas(): void {
    this.pagina++;
    this.cargandoMas.set(true);
    this.pedirPagina(lista => this.publicaciones.update(actuales => [...actuales, ...lista]));
  }

  abrir(p: PublicacionResumen): void {
    this.router.navigate(['/foro', p.id]);
  }

  private pedirPagina(aplicar: (lista: PublicacionResumen[]) => void): void {
    this.foroService.listar({
      tema: this.tema(),
      busqueda: this.busqueda(),
      orden: this.orden(),
      page: this.pagina,
      size: TAMANO_PAGINA
    }).subscribe({
      next: (lista) => {
        aplicar(lista);
        this.hayMas.set(lista.length === TAMANO_PAGINA);
        this.cargando.set(false);
        this.cargandoMas.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.cargandoMas.set(false);
        this.snackBar.open(err?.message || 'No se pudo cargar el foro', 'Cerrar', { duration: 3500 });
      }
    });
  }
}
