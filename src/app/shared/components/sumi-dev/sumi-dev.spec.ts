import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SumiDev } from './sumi-dev';

describe('SumiDev', () => {
  it('es una imagen sin texto visible, con Sumi de gafas, audífonos y portátil', () => {
    TestBed.configureTestingModule({ imports: [SumiDev], providers: [provideZonelessChangeDetection()] });
    const f = TestBed.createComponent(SumiDev);
    f.componentRef.setInput('tamano', 50);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const dev = el.querySelector('.dev') as HTMLElement;
    expect(dev.getAttribute('role')).toBe('img');
    expect(dev.getAttribute('aria-label')).toContain('Desarrollador de SAESU');
    expect(dev.style.getPropertyValue('--t')).toBe('50px');
    // Sin texto visible: el nombre solo va en aria-label y title
    expect(el.textContent).not.toContain('Desarrollador');
    expect(dev.getAttribute('title')).toBe('Desarrollador de SAESU');
    expect(el.querySelector('app-mascota')!.className).toContain('sumi--con-gafas');
    expect(el.querySelectorAll('.dev__auricular').length).toBe(2);
    expect(el.querySelector('.dev__tapa')).toBeTruthy();
  });
});
