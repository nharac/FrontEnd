import { Usuario } from './usuario.model';


export interface AuthResponse {
  usuario: Usuario;
  token: string;
}
/** Respuesta de POST /api/auth/registro: cuenta creada sin verificar (sin token). */
export interface RegistroResponse {
  correo: string;
  mensaje: string;
  minutosVigencia: number;
}
