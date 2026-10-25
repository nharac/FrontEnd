import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { PerfilService } from '../../../../core/services/perfil.service';

@Component({
  selector: 'app-dashboard-estudiante',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard-estudiante.html',
  styleUrl: './dashboard-estudiante.scss',
})
export class DashboardEstudiante implements OnInit {

  private router = inject(Router);
  private perfilService = inject(PerfilService);

  /** Primer nombre del usuario autenticado (GET /api/auth/perfil). */
  readonly nombre = this.perfilService.primerNombre;

  /** Datos mockeados (después vendrán del backend). */
  racha = 5;
  minutosEstimados = 15;

  ngOnInit(): void {
    this.perfilService.cargar();
  }

  irAPractica(): void {
    this.router.navigate(['/practica']);
  }
}