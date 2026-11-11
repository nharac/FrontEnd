import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { EstiloSumi, EstiloSumiService, ParteSumi, PrendaSumi } from '../../../core/services/estilo-sumi.service';

/** Partes del vestidor tal como las nombra el backend (columnas de sumi_estilo). */
/** Categoría del catálogo = parte del vestidor (una sola definición). */
export type CategoriaSumi = ParteSumi;

/** GET /api/sumi/vestidor (y respuesta de comprar y vestir) */
export interface EstadoVestidor {
  monedas: number;
  docente: boolean;
  /** Prendas compradas como "categoria:prenda". */
  inventario: string[];
  estilo: Partial<EstiloSumi>;
}

/** GET /api/sumi/monedas/historial */
export interface MovimientoMoneda {
  cantidad: number;
  motivo: string;
  fecha: string;
}

/**
 * Sumi Monedas y tienda del vestidor. El saldo, lo comprado y lo que Sumi lleva puesto
 * viven en el servidor (así no se pueden alterar desde el navegador y siguen a la persona
 * en cualquier equipo); aquí se guarda una copia para pintar la interfaz.
 */
@Injectable({ providedIn: 'root' })
export class TiendaSumiService {
  private http = inject(HttpClient);
  private estilo = inject(EstiloSumiService);
  private readonly api = `${environment.apiUrl}/sumi`;

  readonly monedas = signal(0);
  readonly docente = signal(false);
  readonly inventario = signal<ReadonlySet<string>>(new Set());
  /** true cuando ya llegó el estado del servidor. */
  readonly cargado = signal(false);

  constructor() {
    // Al cerrar sesión no queda nada de la cuenta anterior (saldo ni colección)
    this.estilo.alOlvidar(() => {
      this.monedas.set(0);
      this.docente.set(false);
      this.inventario.set(new Set());
      this.cargado.set(false);
    });
  }

  /** Trae saldo, colección y estilo (se llama al entrar al portal). */
  cargar(): Observable<EstadoVestidor> {
    return this.http.get<EstadoVestidor>(`${this.api}/vestidor`).pipe(tap(e => this.aplicar(e)));
  }

  comprar(categoria: CategoriaSumi, prenda: string): Observable<EstadoVestidor> {
    return this.http.post<EstadoVestidor>(`${this.api}/vestidor/comprar`, { categoria, prenda })
      .pipe(tap(e => this.aplicar(e, false)));
  }

  /** Guarda en el servidor lo que Sumi lleva puesto ahora. */
  vestir(): Observable<EstadoVestidor> {
    return this.http.put<EstadoVestidor>(`${this.api}/vestidor/estilo`, this.estilo.comoMapa())
      .pipe(tap(e => this.aplicar(e)));
  }

  historial(): Observable<MovimientoMoneda[]> {
    return this.http.get<MovimientoMoneda[]>(`${this.api}/monedas/historial`);
  }

  /** ¿Se la puede poner? Gratis para todos, comprada, o es docente. */
  tiene(categoria: CategoriaSumi, prenda: PrendaSumi<string>): boolean {
    return prenda.precio === 0 || this.docente() || this.inventario().has(`${categoria}:${prenda.id}`);
  }

  private aplicar(e: EstadoVestidor, conEstilo = true): void {
    // Si la sesión se cerró mientras llegaba la respuesta, no se le pone a Sumi lo de esa cuenta
    if (!localStorage.getItem('saesu_token')) {
      return;
    }
    this.monedas.set(e.monedas);
    this.docente.set(e.docente);
    this.inventario.set(new Set(e.inventario));
    if (conEstilo) {
      this.estilo.aplicar(e.estilo);
    }
    this.cargado.set(true);
  }
}
