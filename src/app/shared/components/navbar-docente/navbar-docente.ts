import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, interval } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
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

  private destroyRef = inject(DestroyRef);

  nombreDocente = signal('Docente');
  iniciales = signal('D');
  /** Consultas sin respuesta oficial (badge rojo). */
  pendientes = this.docenteService.pendientes;

  ngOnInit(): void {
    // Contador de consultas pendientes: al entrar, cada minuto y cada vez que se cambia de página
    this.docenteService.refrescarPendientes();
    interval(60_000).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.docenteService.refrescarPendientes());
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.docenteService.refrescarPendientes());

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