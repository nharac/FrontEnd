import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  /** Clave con la que se guarda el token en localStorage. */
  private readonly TOKEN_KEY = 'saesu_token';

  /** Guarda el token. */
  guardar(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /** Obtiene el token. Devuelve null si no existe. */
  obtener(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Elimina el token. Útil al hacer logout. */
  eliminar(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /** Verifica si hay un token guardado. */
  hayToken(): boolean {
    return !!this.obtener();
  }
}