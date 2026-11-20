import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { Campanita, haceCuanto } from './campanita';
import { NotificacionesService } from '../../../core/services/notificaciones.service';

describe('Campanita', () => {
  it('haceCuanto en palabras', () => {
    const ahora = new Date('2026-11-20T10:00:00').getTime();
    expect(haceCuanto('2026-11-20T09:59:50', ahora)).toBe('ahora');
    expect(haceCuanto('2026-11-20T09:45:00', ahora)).toBe('hace 15 min');
    expect(haceCuanto('2026-11-20T07:00:00', ahora)).toBe('hace 3 h');
    expect(haceCuanto('2026-11-19T08:00:00', ahora)).toBe('ayer');
    expect(haceCuanto('2026-11-15T10:00:00', ahora)).toBe('hace 5 días');
  });

  it('cuenta, abre la bandeja, marca y navega', () => {
    const noLeidas = signal(2);
    const s = {
      noLeidas,
      contar: vi.fn(() => of({ noLeidas: 2 })),
      bandeja: vi.fn(() => of({ noLeidas: 2, notificaciones: [{ id: 1, tipo: 'RETO', titulo: 'Ana te retó', mensaje: null, enlace: '/retos', leida: false, creadaEn: '' }] })),
      marcarLeida: vi.fn(() => of(undefined)),
      marcarTodas: vi.fn(() => of({ marcadas: 1 })),
    };
    TestBed.configureTestingModule({ imports: [Campanita], providers: [provideRouter([]), { provide: NotificacionesService, useValue: s }] });
    const f = TestBed.createComponent(Campanita);
    f.detectChanges();
    expect(s.contar).toHaveBeenCalled();
    expect(f.nativeElement.textContent).toContain('2');
    const c = f.componentInstance;
    c.abrir();
    expect(c.lista().length).toBe(1);
    const nav = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    c.ir(c.lista()[0]);
    expect(s.marcarLeida).toHaveBeenCalledWith(1);
    expect(nav).toHaveBeenCalledWith('/retos');
    expect(c.lista()[0].leida).toBe(true);
    c.leerTodas();
    expect(s.marcarTodas).toHaveBeenCalled();
    expect(c.icono('TAREA')).toBe('assignment');
  });
});
