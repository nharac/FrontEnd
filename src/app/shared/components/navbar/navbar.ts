import { Logo } from '../logo/logo';
import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../features/usuario/services/auth.service';
import { TokenService } from '../../../core/services/token.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { RankingService } from '../../../features/gamificacion/services/ranking.service';
import { Medalla } from '../medalla/medalla';
import { esEstudiante } from '../../utils/rol';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [Logo, 
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    Medalla
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
  private rankingService = inject(RankingService);
  /** Puesto en el ranking del usuario (medalla si está en el top 3). */
  readonly miLugar = computed(() => {
    const u = this.perfilService.usuario();
    return u && esEstudiante(u.rol) ? this.rankingService.lugarDe(u.id) : null;
  });

  ngOnInit(): void {
    this.perfilService.cargar();
    this.rankingService.cargarTop();
  }

  /** Inicial para el avatar. */
  get inicial(): string {
    return this.nombreUsuario().charAt(0).toUpperCase();
  }

  logout(): void {
    this.perfilService.limpiar();
    this.authService.logout();
    void this.router.navigate(['/auth']);
  }
}