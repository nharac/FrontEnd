import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { Rol } from '../../features/usuario/models/rol.enum';

describe('TokenService', () => {
  let servicio: TokenService;

  beforeEach(() => {
    localStorage.clear();
    servicio = TestBed.inject(TokenService);
  });

  it('guarda, lee y elimina el token y el rol', () => {
    expect(servicio.hayToken()).toBe(false);
    servicio.guardar('jwt-123');
    servicio.guardarRol('DOCENTE');

    expect(servicio.obtener()).toBe('jwt-123');
    expect(servicio.hayToken()).toBe(true);
    expect(servicio.obtenerRol()).toBe(Rol.DOCENTE);
    expect(servicio.esDocente()).toBe(true);

    servicio.eliminar();
    expect(servicio.obtener()).toBeNull();
    expect(servicio.obtenerRol()).toBeNull();
  });

  it('normaliza el rol aunque venga como ROLE_estudiante', () => {
    servicio.guardarRol('ROLE_estudiante');
    expect(servicio.obtenerRol()).toBe(Rol.ESTUDIANTE);
    expect(servicio.esDocente()).toBe(false);
  });
});
