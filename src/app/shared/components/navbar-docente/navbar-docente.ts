import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../features/usuario/services/auth.service';

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
export class NavbarDocente {

  private authService = inject(AuthService);
  private router = inject(Router);

  nombreDocente = 'Prof. Guillermo Ariza';
  iniciales = 'GA';

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}