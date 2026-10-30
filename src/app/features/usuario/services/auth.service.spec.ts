import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { TokenService } from '../../../core/services/token.service';
import { environment } from '../../../../environments/environment';

const API = `${environment.apiUrl}/auth`;
const respuesta = { token: 'jwt', refreshToken: 'r', usuario: { id: 1, nombre: 'Laura', correo: 'laura@ucundinamarca.edu.co', rol: 'ESTUDIANTE' } };

describe('AuthService', () => {
  let servicio: AuthService;
  let backend: HttpTestingController;
  let tokens: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(AuthService);
    backend = TestBed.inject(HttpTestingController);
    tokens = TestBed.inject(TokenService);
  });

  afterEach(() => backend.verify());

  it('login guarda el token y el rol', () => {
    servicio.login({ correo: 'laura@ucundinamarca.edu.co', password: 'Clave#2026' }).subscribe();
    const req = backend.expectOne(`${API}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(respuesta);
    expect(tokens.obtener()).toBe('jwt');
    expect(tokens.obtenerRol()).toBe('ESTUDIANTE');
  });

  it('verificar el correo abre la sesión igual que el login', () => {
    servicio.verificarCorreo('laura@ucundinamarca.edu.co', '123456').subscribe();
    const req = backend.expectOne(`${API}/verificar-correo`);
    expect(req.request.body).toEqual({ correo: 'laura@ucundinamarca.edu.co', codigo: '123456' });
    req.flush(respuesta);
    expect(tokens.hayToken()).toBe(true);
  });

  it('registro no abre sesión: solo pide el código', () => {
    servicio.registro({ nombre: 'Laura', correo: 'laura@ucundinamarca.edu.co', password: 'Clave#2026' } as never).subscribe();
    backend.expectOne(`${API}/registro`).flush({ correo: 'laura@ucundinamarca.edu.co', mensaje: 'ok', minutosVigencia: 15 });
    expect(tokens.hayToken()).toBe(false);
  });

  it('recuperar contraseña usa los tres pasos del backend', () => {
    servicio.solicitarRecuperacion('a@ucundinamarca.edu.co').subscribe();
    backend.expectOne(`${API}/recuperar`).flush({ mensaje: 'ok' });
    servicio.validarCodigoRecuperacion('a@ucundinamarca.edu.co', '111111').subscribe();
    backend.expectOne(`${API}/recuperar/validar`).flush({ mensaje: 'ok' });
    servicio.restablecerPassword({ correo: 'a@ucundinamarca.edu.co', codigo: '111111', passwordNueva: 'Nueva#2026' }).subscribe();
    expect(backend.expectOne(`${API}/restablecer`).request.body.passwordNueva).toBe('Nueva#2026');
    servicio.reenviarVerificacion('a@ucundinamarca.edu.co').subscribe();
    backend.expectOne(`${API}/reenviar-verificacion`).flush({ mensaje: 'ok' });
  });

  it('logout borra la sesión', () => {
    tokens.guardar('jwt');
    servicio.logout();
    expect(tokens.hayToken()).toBe(false);
  });
});
