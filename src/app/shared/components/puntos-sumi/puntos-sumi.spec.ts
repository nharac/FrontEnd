import { TestBed } from '@angular/core/testing';
import { PuntosSumi } from './puntos-sumi';

describe('PuntosSumi', () => {
  function crear(entradas: Record<string, unknown> = {}) {
    const f = TestBed.createComponent(PuntosSumi);
    for (const [k, v] of Object.entries(entradas)) f.componentRef.setInput(k, v);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('es decorativo por defecto y trae a Sumi completa con su estrellita', () => {
    const el = crear({ tamano: 50 });
    const p = el.querySelector('.p') as HTMLElement;
    expect(p.getAttribute('aria-hidden')).toBe('true');
    expect(p.getAttribute('role')).toBeNull();
    expect(p.style.getPropertyValue('--p')).toBe('50px');
    expect((el.querySelector('app-mascota') as HTMLElement).style.getPropertyValue('--sumi-tamano')).toBe('46px');
    expect(el.querySelector('.p__estrella')).toBeTruthy();
  });

  it('con etiqueta se anuncia como imagen y destacado pone a Sumi a celebrar', () => {
    const el = crear({ etiqueta: 'Puntos Sumi', destacado: '' });
    const p = el.querySelector('.p')!;
    expect(p.getAttribute('role')).toBe('img');
    expect(p.getAttribute('aria-label')).toBe('Puntos Sumi');
    expect(el.classList).toContain('puntos-sumi--destacado');
    expect(el.querySelector('app-mascota')!.className).toContain('sumi--celebra');
  });
});
