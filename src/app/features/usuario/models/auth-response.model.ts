import { Usuario } from './usuario.model';


export interface AuthResponse {
  usuario: Usuario;
  token: string;
}