import { Injectable } from '@angular/core';
import { Rol } from '../../features/usuario/models/rol.enum';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly TOKEN_KEY = 'saesu_token';
  private readonly ROL_KEY = 'saesu_rol';

  guardar(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obtener(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  eliminar(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROL_KEY);
  }

  hayToken(): boolean {
    return !!this.obtener();
  }

  guardarRol(rol: Rol): void {
    localStorage.setItem(this.ROL_KEY, rol);
  }

  obtenerRol(): Rol | null {
    const rol = localStorage.getItem(this.ROL_KEY);
    return rol as Rol | null;
  }

  esDocente(): boolean {
    return this.obtenerRol() === Rol.DOCENTE;
  }
}