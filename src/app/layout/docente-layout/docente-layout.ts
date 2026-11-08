import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TiendaSumiService } from '../../features/gamificacion/services/tienda-sumi.service';
import { NavbarDocente } from '../../shared/components/navbar-docente/navbar-docente';

@Component({
  selector: 'app-docente-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarDocente],
  templateUrl: './docente-layout.html',
  styleUrl: './docente-layout.scss',
})
export class DocenteLayout {
  constructor() {
    // Sumi Monedas, colección y estilo de Sumi guardados en el servidor
    inject(TiendaSumiService).cargar().subscribe({ error: () => undefined });
  }
}