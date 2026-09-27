import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard-estudiante',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard-estudiante.html',
  styleUrl: './dashboard-estudiante.scss',
})
export class DashboardEstudiante {

  private router = inject(Router);

  /** Datos mockeados (después vendrán del backend). */
  nombre = 'Juan';
  racha = 5;
  minutosEstimados = 15;

  irAPractica(): void {
    this.router.navigate(['/practica']);
  }
}