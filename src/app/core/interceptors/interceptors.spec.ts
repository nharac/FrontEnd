import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { jwtInterceptor } from './jwt.interceptor';
import { errorInterceptor } from './error.interceptor';
import { TokenService } from '../services/token.service';

describe('Interceptores HTTP', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('agrega el JWT en la cabecera Authorization cuando hay sesión', () => {
    TestBed.inject(TokenService).guardar('jwt-abc');
    http.get('/api/quiz/historial').subscribe();
    const req = backend.expectOne('/api/quiz/historial');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush({});
  });

  it('no agrega cabecera si no hay sesión', () => {
    http.get('/api/auth/login').subscribe();
    const req = backend.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('convierte los errores del backend en { status, message }', () => {
    let error: { status: number; message: string } | undefined;
    http.post('/api/auth/login', {}).subscribe({ error: (e) => (error = e) });
    backend.expectOne('/api/auth/login').flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
    expect(error).toEqual({ status: 401, message: 'Credenciales inválidas' });
  });

  it('usa el campo error si el backend no manda message', () => {
    let error: { status: number; message: string } | undefined;
    http.get('/api/x').subscribe({ error: (e) => (error = e) });
    backend.expectOne('/api/x').flush({ error: 'Not Found' }, { status: 404, statusText: 'Not Found' });
    expect(error?.message).toBe('Not Found');
  });
});
