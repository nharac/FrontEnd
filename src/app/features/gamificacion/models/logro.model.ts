/** Un logro con su estado (LogroResponse del backend, GET /api/logros). */
export interface Logro {
  codigo: string;
  nombre: string;
  descripcion: string;
  /** Nombre de ícono de Material Symbols. */
  icono: string;
  obtenido: boolean;
  /** null si todavía no lo tiene. */
  fechaObtenido: string | null;
}
