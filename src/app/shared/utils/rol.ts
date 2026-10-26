import { Rol } from '../../features/usuario/models/rol.enum';

/**
 * Normaliza el rol que llega del backend: acepta "ESTUDIANTE", "estudiante"
 * o "ROLE_ESTUDIANTE" (según cómo quedó guardado en la base de datos).
 */
export function normalizarRol(rol: string | null | undefined): Rol | null {
  const limpio = (rol ?? '').trim().toUpperCase().replace(/^ROLE_/, '');
  if (limpio === Rol.ESTUDIANTE) return Rol.ESTUDIANTE;
  if (limpio === Rol.DOCENTE) return Rol.DOCENTE;
  return null;
}

export function esDocente(rol: string | null | undefined): boolean {
  return normalizarRol(rol) === Rol.DOCENTE;
}

export function esEstudiante(rol: string | null | undefined): boolean {
  return normalizarRol(rol) === Rol.ESTUDIANTE;
}
