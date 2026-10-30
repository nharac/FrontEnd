import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { LogroAviso } from '../features/gamificacion/components/logro-aviso/logro-aviso';
import { Aviso } from '../shared/components/aviso/aviso';
import { SumiDice } from '../shared/components/sumi-dice/sumi-dice';

/* eslint-disable @typescript-eslint/no-explicit-any */
const logro = (codigo: string) => ({ codigo, nombre: codigo, descripcion: 'd', icono: 'stars', obtenido: true, fechaObtenido: null });

describe('Componentes compartidos', () => {
  afterEach(() => { vi.useRealTimers(); TestBed.resetTestingModule(); });

  it('el aviso de logros los muestra uno tras otro', async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [LogroAviso], providers: [provideZonelessChangeDetection()] });
    const f = TestBed.createComponent(LogroAviso);
    f.componentRef.setInput('logros', [logro('A'), logro('B')]);
    f.detectChanges();
    const c = f.componentInstance as any;
    expect(c.visible()?.codigo).toBe('A');
    vi.advanceTimersByTime(4000);
    expect(c.visible()?.codigo).toBe('B');
    vi.advanceTimersByTime(4000);
    expect(c.visible()).toBeNull();
    f.destroy();
  });

  it.each([
    { tipo: 'exito', mensaje: 'Pregunta creada', accion: 'Ver' },
    { mensaje: 'No se pudo guardar', titulo: 'Error' },
    { tipo: 'bienvenida', mensaje: 'Hola', nombre: 'Ana Ruiz', esDocente: true },
    { mensaje: 'Archivo descargado', archivo: 'estudiantes.xlsx' },
  ])('el aviso muestra %o', datos => {
    const ref = { dismissWithAction: vi.fn(), dismiss: vi.fn(), containerInstance: { snackBarConfig: { duration: 4000 } } };
    TestBed.configureTestingModule({ imports: [Aviso], providers: [provideZonelessChangeDetection(),
      { provide: MAT_SNACK_BAR_DATA, useValue: datos }, { provide: MatSnackBarRef, useValue: ref }] });
    const f = TestBed.createComponent(Aviso);
    f.detectChanges();
    f.componentInstance.accion();
    f.componentInstance.cerrar();
    expect(ref.dismiss).toHaveBeenCalled();
  });

  it('Sumi cambia de frase', () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [SumiDice], providers: [provideZonelessChangeDetection()] });
    const f = TestBed.createComponent(SumiDice);
    f.componentRef.setInput('mensajes', ['Hola', '¡Vamos!', 'Tú puedes']);
    f.detectChanges();
    vi.advanceTimersByTime(3000);
    (f.componentInstance as any).otro();
    vi.advanceTimersByTime(3000);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).textContent).toBeTruthy();
    f.destroy();
  });
});
