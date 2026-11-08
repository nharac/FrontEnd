import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LogrosGrid } from './logros-grid';
import { Logro, avanceDe, proximosLogros } from '../../models/logro.model';

const l = (codigo: string, categoria: Logro['categoria'], rareza: Logro['rareza'], progreso: number, meta: number,
           fecha: string | null = null, secreto = false): Logro => ({
  codigo, nombre: codigo, descripcion: 'desc ' + codigo, icono: 'star', categoria, rareza, secreto,
  obtenido: !!fecha, fechaObtenido: fecha, progreso, meta });

const LOGROS: Logro[] = [
  l('UNO', 'PRACTICA', 'COMUN', 1, 1, '2026-11-01T10:00:00Z'),
  l('CIEN', 'PRACTICA', 'RARO', 60, 100),
  l('DOS50', 'PRACTICA', 'EPICO', 20, 250),
  l('RACHA', 'RACHAS', 'RARO', 3, 7),
  l('FORO', 'COMUNIDAD', 'COMUN', 1, 1, '2026-11-03T10:00:00Z'),
  l('ZONA', 'RETOS', 'EPICO', 9, 10),
  l('BUHO', 'RETOS', 'RARO', 0, 1, null, true),
  l('CORONA', 'RETOS', 'LEGENDARIO', 3, 3, '2026-11-02T10:00:00Z'),
  l('DESARROLLADOR', 'RETOS', 'EXCLUSIVO', 1, 1, '2026-10-01T10:00:00Z'),
];

describe('LogrosGrid', () => {
  function crear(logros = LOGROS) {
    TestBed.configureTestingModule({ imports: [LogrosGrid], providers: [provideZonelessChangeDetection()] });
    const f = TestBed.createComponent(LogrosGrid);
    f.componentRef.setInput('logros', logros);
    f.detectChanges();
    return f;
  }
  const codigos = (f: ReturnType<typeof crear>, sel: string) =>
    Array.from((f.nativeElement as HTMLElement).querySelectorAll(sel)).map(e => e.querySelector('strong')?.textContent?.trim());

  it('separa las insignias especiales y resume por rareza', () => {
    const f = crear();
    const c = f.componentInstance;
    // La exclusiva no cuenta en el total ni en el resumen por rareza
    expect(c.total()).toBe(8);
    expect(c.obtenidos()).toBe(3);
    expect(c.porcentaje()).toBe(38);
    expect(codigos(f, '.reto')).toEqual(['DESARROLLADOR', 'CORONA', 'ZONA', 'BUHO']);
    expect(c.porRareza().map(r => r.rareza)).toEqual(['COMUN', 'RARO', 'EPICO', 'LEGENDARIO']);
    expect(c.porRareza().find(r => r.rareza === 'RARO')).toEqual({ rareza: 'RARO', nombre: 'Raro', tiene: 0, total: 3 });
    // La vitrina solo muestra las insignias: sin contadores "x de y" ni avance numérico
    const vitrina = (f.nativeElement as HTMLElement).querySelector('.vitrina')!.textContent!;
    expect(vitrina).not.toContain('de 4');
    expect(vitrina).not.toContain('9 / 10');
    expect(f.nativeElement.querySelector('.reto--exclusivo .reto__cinta').textContent).toBe('Exclusiva');
  });

  it('ordena obtenidos primero (el más reciente arriba) y luego por avance', () => {
    const f = crear();
    expect(codigos(f, '.logro')).toEqual(['FORO', 'UNO', 'CIEN', 'RACHA', 'DOS50']);
    expect(f.componentInstance.conteo()['TODOS']).toEqual({ tiene: 2, total: 5 });
    expect(f.componentInstance.conteo()['PRACTICA']).toEqual({ tiene: 1, total: 3 });
  });

  it('filtra por categoría y por estado', () => {
    const f = crear();
    const botones = Array.from((f.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.pestana'));
    botones.find(b => b.textContent?.includes('Rachas'))!.click();
    f.detectChanges();
    expect(codigos(f, '.logro')).toEqual(['RACHA']);

    f.componentInstance.categoria.set('PRACTICA');
    f.componentInstance.estado.set('pendientes');
    f.detectChanges();
    expect(codigos(f, '.logro')).toEqual(['CIEN', 'DOS50']);

    f.componentInstance.categoria.set('RACHAS');
    f.componentInstance.estado.set('obtenidos');
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Todavía no tienes logros en esta categoría');

    f.componentInstance.estado.set('pendientes');
    f.componentInstance.categoria.set('COMUNIDAD');
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('¡Los tienes todos en esta categoría!');
  });

  it('muestra los estados de carga y error', () => {
    const f = crear([]);
    f.componentRef.setInput('cargando', true);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Cargando logros');
    f.componentRef.setInput('cargando', false);
    f.componentRef.setInput('error', true);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('No se pudieron cargar');
  });

  it('la etiqueta accesible dice rareza y avance', () => {
    const c = crear().componentInstance;
    expect(c.etiqueta(LOGROS[1])).toBe('CIEN, Raro, pendiente, 60 de 100: desc CIEN');
    expect(c.etiqueta(LOGROS[0])).toBe('UNO, Común, obtenido: desc UNO');
  });
});

describe('logro.model', () => {
  it('avanceDe y proximosLogros', () => {
    expect(avanceDe(LOGROS[1])).toBe(60);
    expect(avanceDe(LOGROS[0])).toBe(100);
    expect(avanceDe({ ...LOGROS[1], meta: 0 })).toBe(0);
    // ZONA (90 %) antes que CIEN (60 %); el secreto y los obtenidos no se sugieren
    expect(proximosLogros(LOGROS).map(x => x.codigo)).toEqual(['ZONA', 'CIEN', 'RACHA']);
    // A igual avance gana el menos raro
    const empate = [l('A', 'PRACTICA', 'EPICO', 1, 2), l('B', 'PRACTICA', 'COMUN', 5, 10)];
    expect(proximosLogros(empate, 1)[0].codigo).toBe('B');
    // Llegó a la meta pero le falta otra condición: no se sugiere
    expect(proximosLogros([l('P', 'PRACTICA', 'EPICO', 50, 50)])).toEqual([]);
  });
});
