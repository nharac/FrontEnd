import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DespedidaComponent } from './despedida';
import { DespedidaService, DURACION_DESPEDIDA } from '../../../core/services/despedida.service';

describe('Despedida al cerrar sesión', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('con movimiento reducido cierra la sesión de inmediato', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const s = TestBed.inject(DespedidaService);
    const cerrar = vi.fn();
    s.cerrarSesion('Ana Ruiz', cerrar);
    expect(cerrar).toHaveBeenCalledOnce();
    expect(s.actual()).toBeNull();
  });

  it('muestra a Sumi despidiéndose y luego cierra la sesión', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const f = TestBed.createComponent(DespedidaComponent);
    const s = TestBed.inject(DespedidaService);
    const cerrar = vi.fn();

    s.cerrarSesion('  Luiferney Ortiz ', cerrar);
    s.cerrarSesion('otra vez', cerrar); // doble clic: se ignora
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('¡Hasta pronto, Luiferney!');
    expect(cerrar).not.toHaveBeenCalled();

    vi.advanceTimersByTime(DURACION_DESPEDIDA);
    f.detectChanges();
    expect(cerrar).toHaveBeenCalledOnce();
    expect(f.nativeElement.querySelector('.despedida--saliendo')).not.toBeNull();

    vi.advanceTimersByTime(1000);
    f.detectChanges();
    expect(s.actual()).toBeNull();
    expect(f.nativeElement.querySelector('.despedida')).toBeNull();
  });

  it('cancelar quita la cortina sin cerrar la sesión', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const s = TestBed.inject(DespedidaService);
    const cerrar = vi.fn();
    s.cerrarSesion('', cerrar);
    expect(s.actual()?.nombre).toBe('');
    s.cancelar();
    vi.advanceTimersByTime(DURACION_DESPEDIDA * 2);
    expect(cerrar).not.toHaveBeenCalled();
    expect(s.actual()).toBeNull();
  });
});
