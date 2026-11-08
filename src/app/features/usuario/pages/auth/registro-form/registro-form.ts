import { OjoPassword } from '../../../../../shared/components/ojo-password/ojo-password';
import { SumiDice, TonoSumi } from '../../../../../shared/components/sumi-dice/sumi-dice';
import { EstadoMascota } from '../../../../../shared/components/mascota/mascota';
import { FuerzaPassword } from '../../../../../shared/components/fuerza-password/fuerza-password';
import { reglasPassword } from '../../../../../shared/utils/password';
import { Component, EventEmitter, Output, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../services/auth.service';
import { RegistroRequest } from '../../../models';

/** Solo se aceptan correos institucionales (mismo patrón que valida el backend). */
const CORREO_INSTITUCIONAL = /^[a-zA-Z0-9._%+-]+@ucundinamarca\.edu\.co$/;

/** Mayúscula, minúscula, número y carácter especial (mismo patrón que valida el backend). */
const PASSWORD_SEGURA = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;

type CampoRegistro = 'nombre' | 'correo' | 'password' | 'confirmar';

interface MensajeSumi {
  estado: EstadoMascota;
  titulo: string;
  texto: string;
  tono: TonoSumi;
}

@Component({
  selector: 'app-registro-form',
  imports: [OjoPassword, SumiDice, FuerzaPassword,
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  styleUrl: './registro-form.scss',
  templateUrl: './registro-form.html',
})
export class RegistroForm {

  @Output() cambiarModo = new EventEmitter<void>();

  cargando = signal(false);
  mostrarPassword = signal(false);
  mostrarConfirmPassword = signal(false);

  registroForm: FormGroup;

  /** Último campo que el usuario tocó: Sumi da la indicación de ese campo. */
  campo = signal<CampoRegistro | null>(null);
  /** El servidor rechazó el registro: Sumi se pone nerviosa y lo explica. */
  errorServidor = signal('');

  /** Valores del formulario como signal (para que Sumi y la barra reaccionen al escribir). */
  private valores!: () => { nombre?: string; correo?: string; password?: string; confirmPassword?: string };

  passwordValor = computed(() => this.valores().password ?? '');
  correoOk = computed(() => CORREO_INSTITUCIONAL.test((this.valores().correo ?? '').trim()));
  passwordOk = computed(() => reglasPassword(this.passwordValor()).every(r => r.ok));
  coinciden = computed(() => !!this.valores().confirmPassword && this.valores().confirmPassword === this.passwordValor());

  /** Lo que dice Sumi según el campo y lo que falta. */
  sumi = computed<MensajeSumi>(() => {
    const v = this.valores();
    if (this.cargando()) {
      return { estado: 'pensando', titulo: 'Un momento…', texto: 'Estoy creando tu cuenta y enviándote el código.', tono: 'normal' };
    }
    if (this.errorServidor()) {
      return { estado: 'nervioso', titulo: 'Algo salió mal', texto: this.errorServidor(), tono: 'alerta' };
    }
    const nombreOk = (v.nombre ?? '').trim().length >= 3;
    if (nombreOk && this.correoOk() && this.passwordOk() && this.coinciden()) {
      return { estado: 'celebra', titulo: '¡Todo listo!', texto: 'Toca «Registrarse» y te envío un código a tu correo para activar la cuenta.', tono: 'exito' };
    }
    switch (this.campo()) {
      case 'nombre':
        return { estado: 'feliz', titulo: 'Tu nombre', texto: 'Escribe tu nombre completo: así te verán tus compañeros en el foro y el ranking.', tono: 'normal' };
      case 'correo':
        return this.correoOk()
          ? { estado: 'feliz', titulo: '¡Ese correo sirve!', texto: 'Ahí te llegará el código de 6 dígitos para activar tu cuenta.', tono: 'exito' }
          : { estado: 'pensando', titulo: 'Tu correo de la U', texto: 'Usa tu correo institucional @ucundinamarca.edu.co. Solo los estudiantes de la U pueden entrar.', tono: 'info' };
      case 'password':
        return this.passwordOk()
          ? { estado: 'celebra', titulo: '¡Contraseña segura!', texto: 'Ahora repítela abajo para confirmar.', tono: 'exito' }
          : { estado: 'pensando', titulo: 'Una contraseña segura', texto: 'Mezcla mayúsculas, minúsculas, números y un símbolo. Abajo te marco lo que falta.', tono: 'normal' };
      case 'confirmar':
        return this.coinciden()
          ? { estado: 'feliz', titulo: '¡Coinciden!', texto: 'Revisa que todo esté bien y regístrate.', tono: 'exito' }
          : { estado: 'pensando', titulo: 'Repítela', texto: 'Escribe la misma contraseña para asegurarnos de que no haya un error de tecleo.', tono: 'normal' };
      default:
        return { estado: 'saludo', titulo: '¡Hola! Soy Sumi', texto: 'Te ayudo a crear tu cuenta. Solo toma un minuto.', tono: 'normal' };
    }
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(CORREO_INSTITUCIONAL)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(PASSWORD_SEGURA)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordsIgualesValidator
    });
    this.valores = toSignal(this.registroForm.valueChanges, { initialValue: this.registroForm.value });
  }

  get nombre() { return this.registroForm.get('nombre'); }
  get correo() { return this.registroForm.get('correo'); }
  get password() { return this.registroForm.get('password'); }
  get confirmPassword() { return this.registroForm.get('confirmPassword'); }

  /** El usuario entró a un campo: Sumi cambia de indicación. */
  enfocar(campo: CampoRegistro): void {
    this.campo.set(campo);
    this.errorServidor.set('');
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update(v => !v);
  }

  toggleMostrarConfirmPassword(): void {
    this.mostrarConfirmPassword.update(v => !v);
  }

  /** Valida que password y confirmPassword sean iguales. */
  private passwordsIgualesValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsDistintas: true };
  };

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorServidor.set('');
    const { nombre, correo, password } = this.registroForm.value;
    const request: RegistroRequest = { nombre, correo, password };

    this.authService.registro(request).subscribe({
      next: (res) => {
        this.cargando.set(false);
        // Doble verificación: la cuenta se activa con el código que llegó al correo institucional
        void this.router.navigate(['/auth/verificar'], { queryParams: { correo: res.correo } });
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorServidor.set(err.message || 'No se pudo crear la cuenta. Intenta de nuevo.');
        this.snackBar.open(err.message || 'Error al registrar', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}