/** Tipos de aviso (snackbar) de SAESU. */
export type TipoAviso = 'exito' | 'error' | 'info' | 'bienvenida';

export interface DatosAviso {
  tipo?: TipoAviso;
  mensaje: string;
  /** Texto del botón (ej. "Deshacer"). "Cerrar" se muestra como una ✕. */
  accion?: string;
  // Solo para la bienvenida
  nombre?: string;
  fotoUrl?: string | null;
  esDocente?: boolean;
}

const ERROR = /no se pudo|error|inválid|no puede|demasiad|incorrect|no coinciden|no se encontr|debe ser|solo un docente|no tienes|falló|vencid|expir/i;
const EXITO = /cread[ao]|actualizad[ao]|publicad[ao]|restaurad[ao]|descargad[ao]|exitos|borrad[ao]|marcada|guardad[ao]|bienvenid|enviad[ao]|activad[ao]|¡/i;

/** Adivina el tipo por el texto, para los avisos que se abren con snackBar.open(mensaje, ...). */
export function inferirTipo(mensaje: string): TipoAviso {
  if (ERROR.test(mensaje)) return 'error';
  if (EXITO.test(mensaje)) return 'exito';
  return 'info';
}

/** "Buenos días" / "Buenas tardes" / "Buenas noches" según la hora local. */
export function saludoSegunHora(fecha = new Date()): string {
  const h = fecha.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
