import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { Mascota } from '../mascota/mascota';
import { TokenService } from '../../../core/services/token.service';

/** Página 404: Sumi perdida con su lupa y un botón para volver. */
@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink, MatIconModule, Mascota],
  template: `
    <main class="nf">
      <div class="nf__tarjeta">
        <span class="nf__codigo" aria-hidden="true">4<app-mascota estado="pensando" accesorio="lupa" [tamano]="120" />4</span>
        <h1>¡Uy! Me perdí</h1>
        <p>Busqué por todas partes y esta página no existe. Puede que el enlace esté mal escrito o que la hayan movido.</p>
        <a class="nf__boton" [routerLink]="destino">
          <mat-icon>home</mat-icon> {{ conSesion ? 'Volver al inicio' : 'Ir a iniciar sesión' }}
        </a>
      </div>
    </main>
  `,
  styles: [`
    .nf { min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; box-sizing: border-box;
          background: linear-gradient(135deg, #f5f3ff 0%, #eef2ff 50%, #ecfeff 100%); font-family: 'Poppins', sans-serif; }
    .nf__tarjeta { max-width: 460px; padding: 36px 28px; border-radius: 24px; background: #fff; text-align: center;
                   box-shadow: 0 20px 50px rgba(79, 70, 229, 0.15); }
    .nf__codigo { display: flex; align-items: center; justify-content: center; gap: 4px;
                  font-size: 110px; font-weight: 800; line-height: 1; color: #4f46e5;
                  background: linear-gradient(135deg, #4f46e5, #7c3aed); -webkit-background-clip: text; background-clip: text;
                  -webkit-text-fill-color: transparent; }
    h1 { margin: 14px 0 8px; font-size: 26px; color: #1f2937; }
    p { margin: 0 0 22px; color: #6b7280; font-size: 14.5px; line-height: 1.6; }
    .nf__boton { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 12px;
                 background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-weight: 600; text-decoration: none;
                 box-shadow: 0 10px 22px rgba(79, 70, 229, 0.3); transition: transform 0.2s; }
    .nf__boton:hover { transform: translateY(-2px); }
    @media (max-width: 420px) { .nf__codigo { font-size: 80px; } }
  `],
})
export class NoEncontrada {
  private readonly token = inject(TokenService);
  readonly conSesion = this.token.hayToken();
  readonly destino = !this.conSesion ? '/auth' : this.token.esDocente() ? '/docente' : '/dashboard';
}
