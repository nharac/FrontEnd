import { TestBed } from '@angular/core/testing';
import { FuerzaPassword } from './fuerza-password';
import { reglasPassword } from '../../utils/password';

describe('FuerzaPassword', () => {
  it('cuenta las reglas cumplidas y nombra el nivel', async () => {
    const f = TestBed.createComponent(FuerzaPassword);
    f.componentRef.setInput('password', '');
    f.detectChanges();
    expect(f.componentInstance.cumplidas()).toBe(0);
    expect(f.nativeElement.className).toContain('fp--n0');

    f.componentRef.setInput('password', 'abcdefgh1');
    f.detectChanges();
    expect(f.componentInstance.cumplidas()).toBe(3);
    expect(f.nativeElement.textContent).toContain('Regular');
    expect(f.nativeElement.querySelectorAll('.fp__barra span.on').length).toBe(3);

    f.componentRef.setInput('password', 'Clave123!');
    f.detectChanges();
    expect(f.componentInstance.nivel().nombre).toBe('Segura');
    expect(f.nativeElement.querySelectorAll('li.ok').length).toBe(5);
  });

  it('reglasPassword coincide con lo que pide el backend', () => {
    expect(reglasPassword('Clave123!').every(r => r.ok)).toBe(true);
    expect(reglasPassword('clave123').map(r => r.ok)).toEqual([true, false, true, true, false]);
  });
});
