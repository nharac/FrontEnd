import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, describe, expect, it } from 'vitest';
import { montar, pintar, limpiar, peticiones, errores, texto } from './montar.testing';

import { RetoDia } from '../features/practica/components/reto-dia/reto-dia';
import { PuntosSumi } from '../shared/components/puntos-sumi/puntos-sumi';
import { MonedaSumi } from '../shared/components/moneda-sumi/moneda-sumi';
import { Mascota } from '../shared/components/mascota/mascota';
import { EstiloSumiService } from '../core/services/estilo-sumi.service';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('Reto del día con una sola oportunidad', () => {
  afterEach(() => limpiar());

  it('acertar: +30 puntos, sin segunda respuesta y recarga las monedas', async () => {
    const f = await montar(RetoDia);
    const c = f.componentInstance as any;
    await pintar(f);
    expect(c.reto().estado).toBe('pendiente');
    expect(texto(f)).toContain('una sola oportunidad');
    c.responder(); // sin elegir no envía nada
    expect(peticiones.some(p => p.url.endsWith('/reto/responder'))).toBe(false);

    c.abierto.set(true);
    await pintar(f);
    expect(texto(f)).toContain('Solo tienes una oportunidad');
    c.elegida.set(1);
    expect(c.estadoOpcion({ id: 1 })).toBe('seleccionada');
    c.responder();
    await pintar(f);
    expect(peticiones.find(p => p.url.endsWith('/reto/responder'))?.cuerpo).toEqual({ opcionId: 1 });
    expect(c.reto().estado).toBe('ganado');
    expect(c.celebrar()).toBe(true);
    expect(peticiones.some(p => p.metodo === 'GET' && p.url.endsWith('/sumi/vestidor'))).toBe(true);
    expect(texto(f)).toContain('Ganaste +30 Puntos Sumi');
    expect(c.estadoOpcion({ id: 1 })).toBe('correcta');
    expect(c.estadoOpcion({ id: 2 })).toBe('normal');
    // Las opciones quedan bloqueadas
    const botones = f.nativeElement.querySelectorAll('.reto__opciones button') as NodeListOf<HTMLButtonElement>;
    expect([...botones].every(b => b.disabled)).toBe(true);
    expect(f.nativeElement.querySelector('.reto__acciones')).toBeNull();
  });

  it('fallar: pierde el reto y muestra la correcta', async () => {
    const f = await montar(RetoDia);
    const c = f.componentInstance as any;
    await pintar(f);
    c.abierto.set(true);
    c.elegida.set(3);
    c.responder();
    await pintar(f);
    expect(c.reto().estado).toBe('perdido');
    expect(c.titulo()).toContain('Perdiste el reto de hoy');
    expect(c.letraCorrecta()).toBe('A');
    expect(c.estadoOpcion({ id: 3 })).toBe('incorrecta');
    expect(c.estadoOpcion({ id: 1 })).toBe('correcta');
    expect(c.sumi()).toBe('animo');
    expect(c.celebrar()).toBe(false);
    expect(texto(f)).toContain('La respuesta correcta era la A');

    // Al volver a entrar sigue perdido y solo deja ver la respuesta
    c.cerrar();
    await pintar(f);
    expect(texto(f)).toContain('Ver respuesta');
    expect(texto(f)).not.toContain('Aceptar reto');
  });

  it('si ya respondió en otra pestaña (409) muestra cómo quedó; otros errores dejan reintentar', async () => {
    const f = await montar(RetoDia);
    const c = f.componentInstance as any;
    await pintar(f);
    c.abierto.set(true);
    c.elegida.set(2);
    errores.set(/\/reto\/responder$/, 500);
    c.responder();
    await pintar(f);
    expect(c.error()).toContain('No se pudo enviar');
    expect(c.reto().estado).toBe('pendiente');
    expect(c.enviando()).toBe(false);

    errores.set(/\/reto\/responder$/, 409);
    c.responder();
    await pintar(f);
    expect(peticiones.filter(p => p.metodo === 'GET' && p.url.endsWith('/practica/reto')).length).toBe(2);
  });

  it('sin reto (error al cargar) no se muestra', async () => {
    errores.set(/\/practica\/reto$/, 404);
    const f = await montar(RetoDia);
    await pintar(f);
    expect(f.nativeElement.querySelector('.reto')).toBeNull();
  });

  it('el ícono de Puntos Sumi siempre usa la Sumi clásica', async () => {
    const f = await montar(PuntosSumi);
    const estilo = TestBed.inject(EstiloSumiService);
    estilo.sombrero.set('gorra' as any);
    estilo.bufanda.set('colombia' as any);
    await pintar(f);
    const m = f.debugElement.query(By.directive(Mascota)).componentInstance as Mascota;
    expect(m.clasica()).toBe(true);
    expect(m.dibujoSombrero()).toBe('');
    expect(m.clases()).toContain('sumi--b-saesu');
  });

  it('el ícono de Sumi Monedas también, y la Sumi normal sí lleva el vestidor', async () => {
    const f = await montar(MonedaSumi);
    const estilo = TestBed.inject(EstiloSumiService);
    estilo.sombrero.set('gorra' as any);
    estilo.fondo.set('playa' as any);
    await pintar(f);
    const m = f.debugElement.query(By.directive(Mascota)).componentInstance as Mascota;
    expect(m.clasica()).toBe(true);
    expect(m.dibujoSombrero()).toBe('');
    expect(m.dibujoFondo()).toBe('');

    const normal = TestBed.createComponent(Mascota);
    normal.componentRef.setInput('conFondo', true);
    normal.detectChanges();
    expect(normal.componentInstance.dibujoSombrero()).not.toBe('');
    expect(normal.componentInstance.dibujoFondo()).not.toBe('');
    normal.destroy();
  });
});
