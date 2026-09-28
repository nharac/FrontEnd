import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-docente',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './dashboard-docente.html',
  styleUrl: './dashboard-docente.scss',
})
export class DashboardDocente {

  nombreDocente = 'Prof. Guillermo Ariza';

  //cuando se termine lo de los end points se trae informacion
}