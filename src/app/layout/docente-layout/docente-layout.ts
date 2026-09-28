import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarDocente } from '../../shared/components/navbar-docente/navbar-docente';

@Component({
  selector: 'app-docente-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarDocente],
  templateUrl: './docente-layout.html',
  styleUrl: './docente-layout.scss',
})
export class DocenteLayout {}