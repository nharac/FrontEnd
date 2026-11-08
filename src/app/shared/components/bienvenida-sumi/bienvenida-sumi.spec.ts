import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BienvenidaSumi } from './bienvenida-sumi';
import { BienvenidaService } from '../../../core/services/bienvenida.service';
import { MENSAJES, alAzar, mensajeBienvenida, momentoDelDia, tituloBienvenida } from './bienvenida-sumi.textos';

const primero = <T>(l: readonly T[]) => l[0];
const ultimo = <T>(l: readonly T[]) => l[l.length - 1];

function montar() {
  TestBed.configureTestingModule({ imports: [BienvenidaSumi], providers: [provideZonelessChangeDetection()] });
  const f = TestBed.createComponent(BienvenidaSumi);
  f.componentInstance.elegir = primero;
  f.componentInstance.ahora = () => new Date(2026, 10, 4, 9, 0);
  f.detectChanges();
  return { f, servicio: TestBed.inject(BienvenidaService), texto: () => (f.nativeElement as HTMLElement).textContent ?? '' };
}

describe('Textos de la bienvenida', () => {
  const estudiante = { nombre: 'Laura', nuevo: false, esDocente: false };

  it('saluda según la hora o de forma informal', () => {
    expect(momentoDelDia(9)).toBe('manana');
    expect(momentoDelDia(15)).toBe('tarde');
    expect(momentoDelDia(22)).toBe('noche');
    expect(momentoDelDia(3)).toBe('noche');
    expect(tituloBienvenida(estudiante, 'Laura', 9, primero)).toEqual({ antes: '¡Buenos días, ', nombre: 'Laura', despues: '!', emoji: '☀️' });
    expect(tituloBienvenida(estudiante, 'Laura', 15, primero).emoji).toBe('🌤️');
    expect(tituloBienvenida(estudiante, 'Laura', 9, ultimo).antes).toBe('¡Hey, ');
    expect(tituloBienvenida({ ...estudiante, nuevo: true }, '', 9, primero)).toEqual({ antes: '¡Hola!', nombre: '', despues: '', emoji: '🎉' });
  });

  it('elige el mensaje según la racha, la hora y el rol', () => {
    expect(mensajeBienvenida({ ...estudiante, nuevo: true }, 9, primero)).toBe(MENSAJES.nuevoEstudiante[0]);
    expect(mensajeBienvenida({ ...estudiante, nuevo: true, esDocente: true }, 9, primero)).toBe(MENSAJES.nuevoDocente[0]);
    expect(mensajeBienvenida({ ...estudiante, esDocente: true }, 9, primero)).toBe(MENSAJES.docente[0]);
    expect(mensajeBienvenida({ ...estudiante, racha: 9 }, 9, primero)).toContain('¡9 días seguidos!');
    expect(mensajeBienvenida({ ...estudiante, racha: 1 }, 9, primero)).toContain('¡Llevas 1 día de racha!');
    expect(mensajeBienvenida({ ...estudiante, racha: 3 }, 9, ultimo)).toContain('3 días');
    expect(mensajeBienvenida(estudiante, 23, primero)).toBe(MENSAJES.noche[0]);
    expect(mensajeBienvenida(estudiante, 10, primero)).toBe(MENSAJES.regreso[0]);
  });

  it('al azar siempre devuelve una de las opciones', () => {
    for (let i = 0; i < 30; i++) expect(MENSAJES.regreso).toContain(alAzar(MENSAJES.regreso));
  });
});

describe('Bienvenida de Sumi', () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); TestBed.resetTestingModule(); });

  it('no muestra nada si nadie ha entrado', () => {
    const { texto } = montar();
    expect(texto().trim()).toBe('');
  });

  it('a un estudiante nuevo lo recibe con lo que puede hacer en SAESU', () => {
    const { f, servicio, texto } = montar();
    servicio.mostrar({ nombre: 'Laura Gómez', nuevo: true, esDocente: false });
    f.detectChanges();
    expect(texto()).toContain('¡Hola, Laura!');
    expect(texto()).toContain('Práctica tipo ICFES');
    expect(texto()).toContain('¡Empecemos!');
    expect((f.nativeElement as HTMLElement).querySelector('.bv__nombre')?.textContent).toBe('Laura');
  });

  it('a quien regresa le recuerda su racha y sus puntos', () => {
    const { f, servicio, texto } = montar();
    servicio.mostrar({ nombre: 'Laura', nuevo: false, esDocente: false, racha: 1, puntos: 640 });
    f.detectChanges();
    expect(texto()).toContain('¡Buenos días, Laura!');
    expect(texto()).toContain('1 día de racha');
    expect(texto()).toContain('640 Puntos Sumi');
    servicio.mostrar({ nombre: 'Laura', nuevo: false, esDocente: false, racha: 3, puntos: 0 });
    f.detectChanges();
    expect(texto()).toContain('3 días de racha');
    servicio.mostrar({ nombre: 'Laura', nuevo: false, esDocente: false });
    f.detectChanges();
    expect(texto()).toContain(MENSAJES.regreso[0]);
  });

  it('al docente le habla de sus estudiantes', () => {
    const { f, servicio, texto } = montar();
    servicio.mostrar({ nombre: '', nuevo: true, esDocente: true });
    f.detectChanges();
    expect(texto()).toContain('¡Hola!');
    expect(texto()).toContain('Banco de preguntas');
    servicio.mostrar({ nombre: 'Luiferney Ortiz', nuevo: false, esDocente: true });
    f.detectChanges();
    expect(texto()).toContain('Tus estudiantes te esperan');
  });

  it('se cierra sola, con el botón, con un clic afuera o con Esc', () => {
    vi.useFakeTimers();
    const { f, servicio } = montar();
    const el = f.nativeElement as HTMLElement;
    servicio.mostrar({ nombre: 'Laura', nuevo: false, esDocente: false });
    f.detectChanges();
    vi.advanceTimersByTime(7000 + 500);
    expect(servicio.actual()).toBeNull();

    servicio.mostrar({ nombre: 'Laura', nuevo: true, esDocente: false });
    f.detectChanges();
    el.querySelector<HTMLButtonElement>('.bv__boton')!.click();
    f.componentInstance.cerrar(); // un segundo clic mientras sale no hace nada
    vi.advanceTimersByTime(500);
    expect(servicio.actual()).toBeNull();

    servicio.mostrar({ nombre: 'Laura', nuevo: false, esDocente: false });
    f.detectChanges();
    el.querySelector<HTMLElement>('.bv__globo')!.click(); // clic en el globo no la cierra
    el.querySelector<HTMLElement>('.bv')!.click();
    vi.advanceTimersByTime(500);
    expect(servicio.actual()).toBeNull();

    servicio.mostrar({ nombre: 'Laura', nuevo: false, esDocente: false });
    f.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    vi.advanceTimersByTime(500);
    expect(servicio.actual()).toBeNull();
    f.componentInstance.cerrar(); // sin bienvenida no pasa nada
    f.destroy();
  });

  it('escribe el mensaje letra por letra sin partir los emojis', () => {
    vi.useFakeTimers();
    const { f, servicio } = montar();
    vi.spyOn(f.componentInstance, 'movimientoReducido').mockReturnValue(false);
    servicio.mostrar({ nombre: 'Laura', nuevo: false, esDocente: false });
    f.detectChanges();
    expect(f.componentInstance.escrito()).toBe('');
    vi.advanceTimersByTime(1100 + 26 * 5);
    expect(Array.from(f.componentInstance.escrito()).length).toBe(5);
    const completo = f.componentInstance.mensaje();
    vi.advanceTimersByTime(26 * Array.from(completo).length);
    expect(f.componentInstance.escrito()).toBe(completo);
    f.destroy();
  });

  it('respeta "reducir movimiento" en un navegador real', () => {
    const { f } = montar();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(f.componentInstance.movimientoReducido()).toBe(true);
  });
});
