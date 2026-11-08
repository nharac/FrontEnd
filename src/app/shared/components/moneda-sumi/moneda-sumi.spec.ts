import { TestBed } from '@angular/core/testing';
import { MonedaSumi } from './moneda-sumi';

describe('MonedaSumi', () => {
  function crear(entradas: Record<string, unknown> = {}) {
    const f = TestBed.createComponent(MonedaSumi);
    for (const [k, v] of Object.entries(entradas)) f.componentRef.setInput(k, v);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('es decorativa por defecto, usa el tamaño pedido y trae a Sumi completa', () => {
    const el = crear({ tamano: 40 });
    const m = el.querySelector('.m') as HTMLElement;
    expect(m.getAttribute('aria-hidden')).toBe('true');
    expect(m.getAttribute('role')).toBeNull();
    expect(m.style.getPropertyValue('--m')).toBe('40px');
    const sumi = el.querySelector('app-mascota') as HTMLElement;
    expect(sumi).toBeTruthy();
    expect(sumi.style.getPropertyValue('--sumi-tamano')).toBe('32px');
  });

  it('con etiqueta se anuncia como imagen y puede girar con Sumi celebrando', () => {
    const el = crear({ etiqueta: 'Puntos Sumi', gira: '' });
    const m = el.querySelector('.m')!;
    expect(m.getAttribute('role')).toBe('img');
    expect(m.getAttribute('aria-label')).toBe('Puntos Sumi');
    expect(el.classList).toContain('moneda-sumi--gira');
    expect(el.querySelector('app-mascota')!.className).toContain('sumi--celebra');
  });

  it('cada moneda tiene degradados con id propio', () => {
    const a = crear().querySelector('radialGradient')!.id;
    const b = crear().querySelector('radialGradient')!.id;
    expect(a).not.toBe(b);
  });
});
