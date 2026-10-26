import { Rol } from './rol.enum';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  fechaRegistro?: string;
  /** URL de la foto en S3 (pendiente: que GET /api/auth/perfil la devuelva). */
  fotoPerfilUrl?: string | null;
  /** Gamificación (pendiente en GET /api/auth/perfil). */
  rachaActual?: number | null;
  puntosTotales?: number | null;
}
