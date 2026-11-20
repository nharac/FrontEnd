import { TestBed } from '@angular/core/testing';

import { AccesibilidadService } from './accesibilidad.service';

describe('AccesibilidadService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('alterna las opciones, pone la clase en <html> y las recuerda', () => {
    const s = TestBed.inject(AccesibilidadService);
    expect(s.textoGrande()).toBe(false);
    s.alternar('textoGrande');
    s.alternar('altoContraste');
    expect(document.documentElement.classList.contains('texto-grande')).toBe(true);
    expect(document.documentElement.classList.contains('alto-contraste')).toBe(true);
    expect(JSON.parse(localStorage.getItem('saesu-accesibilidad')!)).toEqual(expect.objectContaining({ textoGrande: true, altoContraste: true }));
    s.alternar('textoGrande');
    expect(document.documentElement.classList.contains('texto-grande')).toBe(false);
  });

  it('lee lo guardado al iniciar', () => {
    localStorage.setItem('saesu-accesibilidad', JSON.stringify({ sinAnimaciones: true }));
    const s = TestBed.inject(AccesibilidadService);
    expect(s.sinAnimaciones()).toBe(true);
    expect(document.documentElement.classList.contains('sin-animaciones')).toBe(true);
  });
});
