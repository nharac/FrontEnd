import { AuthResponse, Rol } from '../../models';


export class AuthMockData {

  /** Tiempo simulado de latencia del backend en ms. */
  static readonly DELAY_MS = 800;

  /** Token JWT simulado. */
  static readonly TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MOCK_TOKEN_SAESU';

  /**
   * Simula la respuesta exitosa de login.
   * Ignora la contraseña, usa el correo enviado.
   */
  static loginExitoso(correo: string): AuthResponse {
    return {
      usuario: {
        id: 1,
        nombre: 'Juan Pérez',
        correo,
        rol: Rol.ESTUDIANTE,
        fechaRegistro: new Date().toISOString()
      },
      token: this.TOKEN
    };
  }

  /**
   * Simula la respuesta exitosa de registro.
   * Crea un usuario con los datos enviados.
   */
  static registroExitoso(
    nombre: string,
    correo: string
  ): AuthResponse {
    return {
      usuario: {
        id: Math.floor(Math.random() * 1000),
        nombre,
        correo,
        rol: Rol.ESTUDIANTE,
        fechaRegistro: new Date().toISOString()
      },
      token: this.TOKEN
    };
  }

  /**
   * Errores simulados. Coinciden con el contrato de API.
   */
  static readonly ERRORES = {
    credencialesInvalidas: {
      status: 401,
      message: 'Credenciales inválidas'
    },
    correoDuplicado: {
      status: 409,
      message: 'El correo ya está registrado'
    }
  };

  /** Correos que disparan errores simulados. */
  static readonly CORREOS_ERROR = {
    login: 'error@test.com',
    registro: 'existente@test.com'
  };
}