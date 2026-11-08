import { Injectable, inject } from '@angular/core';
import { EstiloSumiService } from './estilo-sumi.service';
import { Rol } from '../../features/usuario/models/rol.enum';
import { normalizarRol } from '../../shared/utils/rol';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly TOKEN_KEY = 'saesu_token';
  private readonly ROL_KEY = 'saesu_rol';
  private readonly estiloSumi = inject(EstiloSumiService);

  guardar(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obtener(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  eliminar(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROL_KEY);
    // Sumi vuelve a su forma clásica: la personalización es solo de la cuenta que inició sesión
    this.estiloSumi.olvidar();
  }

  hayToken(): boolean {
    return !!this.obtener();
  }

  guardarRol(rol: Rol | string): void {
    localStorage.setItem(this.ROL_KEY, normalizarRol(rol) ?? String(rol));
  }

  obtenerRol(): Rol | null {
    return normalizarRol(localStorage.getItem(this.ROL_KEY));
  }

  esDocente(): boolean {
    return this.obtenerRol() === Rol.DOCENTE;
  }
}