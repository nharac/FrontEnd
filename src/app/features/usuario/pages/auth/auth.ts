import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginForm } from './login-form/login-form';
import { RegistroForm } from './registro-form/registro-form';


@Component({
  selector: 'app-auth',
  imports: [CommonModule, LoginForm, RegistroForm],
  styleUrl: './auth.scss',
  templateUrl: './auth.html',
})
export class Auth {

  /** true = modo registro, false = modo login. */
  modoRegistro = signal(false);

  /** Alterna entre login y registro. */
  toggleModo(): void {
    this.modoRegistro.update(v => !v);
  }
}