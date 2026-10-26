import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../features/usuario/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { PerfilService } from '../../../core/services/perfil.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {

  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private perfilService = inject(PerfilService);
  private router = inject(Router);

  /** Primer nombre del usuario autenticado (GET /api/auth/perfil). */
  readonly nombreUsuario = this.perfilService.primerNombre;
  readonly fotoUrl = this.perfilService.fotoUrl;

  ngOnInit(): void {
    this.perfilService.cargar();
  }

  /** Inicial para el avatar. */
  get inicial(): string {
    return this.nombreUsuario().charAt(0).toUpperCase();
  }

  logout(): void {
    this.perfilService.limpiar();
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}