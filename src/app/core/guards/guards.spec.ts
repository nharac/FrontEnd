import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { publicGuard } from './public.guard';
import { rolDocenteGuard } from './rol-docente.guard';
import { TokenService } from '../services/token.service';

/** Ejecuta un guard funcional dentro del contexto de inyección de Angular. */
function ejecutar(guard: typeof authGuard): boolean | UrlTree {
  return TestBed.runInInjectionContext(() => guard({} as never, {} as never)) as boolean | UrlTree;
}
function ruta(resultado: boolean | UrlTree): string | boolean {
  return resultado instanceof UrlTree ? TestBed.inject(Router).serializeUrl(resultado) : resultado;
}

describe('Guards de rutas', () => {
  let tokens: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    tokens = TestBed.inject(TokenService);
  });

  it('authGuard: sin token manda a /auth; con token deja pasar', () => {
    expect(ruta(ejecutar(authGuard))).toBe('/auth');
    tokens.guardar('jwt');
    expect(ejecutar(authGuard)).toBe(true);
  });

  it('publicGuard: el login es público, pero si ya hay sesión manda al panel de su rol', () => {
    expect(ejecutar(publicGuard)).toBe(true);
    tokens.guardar('jwt');
    tokens.guardarRol('ESTUDIANTE');
    expect(ruta(ejecutar(publicGuard))).toBe('/dashboard');
    tokens.guardarRol('DOCENTE');
    expect(ruta(ejecutar(publicGuard))).toBe('/docente');
  });

  it('rolDocenteGuard: un estudiante no entra al panel docente', () => {
    tokens.guardar('jwt');
    tokens.guardarRol('ESTUDIANTE');
    expect(ruta(ejecutar(rolDocenteGuard))).toBe('/dashboard');
    tokens.guardarRol('DOCENTE');
    expect(ejecutar(rolDocenteGuard)).toBe(true);
  });
});
