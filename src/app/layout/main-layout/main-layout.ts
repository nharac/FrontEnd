import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TiendaSumiService } from '../../features/gamificacion/services/tienda-sumi.service';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  constructor() {
    // Sumi Monedas, colección y estilo de Sumi guardados en el servidor
    inject(TiendaSumiService).cargar().subscribe({ error: () => undefined });
  }
}