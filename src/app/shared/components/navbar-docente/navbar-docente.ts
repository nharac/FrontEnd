import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../features/usuario/services/auth.service';
import { DocenteService } from '../../../features/docente/services/docente.service';

@Component({
  selector: 'app-navbar-docente',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './navbar-docente.html',
  styleUrl: './navbar-docente.scss',
})
export class NavbarDocente implements OnInit {

  private authService = inject(AuthService);
  private docenteService = inject(DocenteService);
  private router = inject(Router);

  nombreDocente = signal('Docente');
  iniciales = signal('D');

  ngOnInit(): void {
    // Nombre real del docente que inició sesión (GET /api/auth/perfil)
    this.docenteService.obtenerPerfil().subscribe({
      next: (u) => {
        this.nombreDocente.set(u.nombre);
        const partes = u.nombre.trim().split(/\s+/);
        this.iniciales.set((partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase());
      }
    });
  }

  logout(): void {
    this.docenteService.limpiarCache();
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}