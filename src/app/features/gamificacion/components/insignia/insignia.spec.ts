import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Insignia } from './insignia';
import { Logro } from '../../models/logro.model';

const base: Logro = { codigo: 'X', nombre: 'X', descripcion: 'd', icono: 'bolt', categoria: 'PRACTICA', rareza: 'EPICO',
  secreto: false, obtenido: false, fechaObtenido: null, progreso: 3, meta: 4 };

describe('Insignia', () => {
  function crear(logro: Logro) {
    TestBed.configureTestingModule({ imports: [Insignia], providers: [provideZonelessChangeDetection()] });
    const f = TestBed.createComponent(Insignia);
    f.componentRef.setInput('logro', logro);
    f.componentRef.setInput('tamano', 80);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('pendiente: gris con candado y anillo de avance', () => {
    const el = crear(base);
    expect(el.querySelector('.ins')!.className).toContain('ins--epico');
    expect(el.querySelector('.ins')!.className).toContain('ins--bloqueada');
    expect(el.querySelector('mat-icon')!.textContent).toBe('lock');
    expect(el.querySelector('.ins__avance')!.getAttribute('stroke-dasharray')).toBe('75 100');
    expect((el.querySelector('.ins') as HTMLElement).style.getPropertyValue('--t')).toBe('80px');
  });

  it('obtenida: su ícono, sin anillo y con brillo', () => {
    const el = crear({ ...base, obtenido: true, fechaObtenido: '2026-11-01' });
    expect(el.querySelector('mat-icon')!.textContent).toBe('bolt');
    expect(el.querySelector('.ins__anillo')).toBeNull();
    expect(el.querySelector('.ins__brillo')).toBeTruthy();
  });

  it('reto: medallón con cinta; secreto sin obtener: signo de pregunta', () => {
    const el = crear({ ...base, categoria: 'RETOS', secreto: true, rareza: undefined as never });
    expect(el.querySelector('.ins')!.className).toContain('ins--especial');
    expect(el.querySelector('.ins')!.className).toContain('ins--comun');
    expect(el.querySelector('.ins__cinta')).toBeTruthy();
    expect(el.querySelector('mat-icon')!.textContent).toBe('question_mark');
  });
});
