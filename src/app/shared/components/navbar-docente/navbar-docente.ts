import { Logo } from '../logo/logo';
import { BotonTema } from '../boton-tema/boton-tema';
import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, interval } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../features/usuario/services/auth.service';
import { DocenteService } from '../../../features/docente/services/docente.service';
import { DespedidaService } from '../../../core/services/despedida.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { Verificado } from '../verificado/verificado';

@Component({
  selector: 'app-navbar-docente',
  standalone: true,
  imports: [Verificado, Logo, BotonTema, 
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
  private despedida = inject(DespedidaService);
  private docenteService = inject(DocenteService);
  private router = inject(Router);
  private perfilService = inject(PerfilService);

  private destroyRef = inject(DestroyRef);

  /** Nombre, iniciales y foto del docente (se actualizan al editar el perfil). */
  nombreDocente = computed(() => this.perfilService.usuario()?.nombre || 'Docente');
  iniciales = computed(() => this.perfilService.iniciales() || 'D');
  foto = this.perfilService.fotoUrl;
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
    this.perfilService.cargar();
  }

  /** Sumi se despide y, mientras cubre la pantalla, se cierra la sesión. */
  logout(): void {
    this.despedida.cerrarSesion(this.nombreDocente(), () => {
      this.docenteService.limpiarCache();
      this.perfilService.limpiar();
      this.authService.logout();
      void this.router.navigate(['/auth']);
    });
  }
}