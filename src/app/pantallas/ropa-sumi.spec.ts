import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { montar, pintar, limpiar, peticiones } from './montar.testing';

import { DISFRACES, EstiloSumiService, ROPAS } from '../core/services/estilo-sumi.service';
import { VARIANTES_DISFRACES, VARIANTES_ROPA } from '../shared/components/mascota/sumi-ropa';
import { DIBUJOS_ROPA, DISFRAZ_COMPLETO, TAPAN_BUFANDA } from '../shared/components/mascota/sumi-prendas';
import { Mascota } from '../shared/components/mascota/mascota';
import { VestidorSumi } from '../features/gamificacion/components/vestidor-sumi/vestidor-sumi';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('Ropa de Sumi', () => {
  afterEach(() => limpiar());

  it('catálogo: 400 camisetas y trajes con los mismos ids y precios que el backend (V28)', () => {
    expect(VARIANTES_ROPA).toHaveLength(400);
    expect(ROPAS).toHaveLength(401);
    expect(ROPAS[0].id).toBe('ninguno');
    expect(new Set(ROPAS.map(r => r.id)).size).toBe(401);
    expect(VARIANTES_ROPA.reduce((s, v) => s + v.precio, 0)).toBe(19305);
    expect(VARIANTES_ROPA.every(v => !!DIBUJOS_ROPA[v.id]?.cuerpo && v.precio > 0 && v.precio % 5 === 0)).toBe(true);
    expect(VARIANTES_ROPA.every(v => !/[{}]/.test(v.nombre + v.dibujo + (v.mangas ?? '')))).toBe(true);
    expect(TAPAN_BUFANDA.size).toBe(173 + 93);
    expect(ROPAS.find(r => r.id === 'camiseta-rojo')!.nombre).toBe('Camiseta roja');
    expect(ROPAS.find(r => r.id === 'pijama-azul')!.nombre).toBe('Pijama azul');
    expect(ROPAS.find(r => r.id === 'armadura-oro')!.nombre).toBe('Armadura de oro');
    expect(ROPAS.find(r => r.id === 'smoking-dorado')!.precio).toBe(95);
  });

  it('mascota: la camiseta va con bufanda y el traje completo la reemplaza', async () => {
    const f = await montar(Mascota);
    f.componentRef.setInput('ropa', 'camiseta-azul');
    await pintar(f);
    const m = f.componentInstance;
    expect(m.dibujoRopa()).toContain('#3b82f6');
    expect(m.dibujoMangas()).not.toBe('');
    expect(m.clases()).not.toContain('sumi--sin-bufanda');
    expect(f.nativeElement.querySelector('.sumi__vestidor-ropa').children.length).toBeGreaterThan(0);

    f.componentRef.setInput('ropa', 'smoking-rojo');
    await pintar(f);
    expect(m.clases()).toContain('sumi--sin-bufanda');

    f.componentRef.setInput('ropa', 'delantal-verde'); // sin mangas
    await pintar(f);
    expect(m.dibujoMangas()).toBe('');

    f.componentRef.setInput('ropa', 'no-existe');
    await pintar(f);
    expect(m.dibujoRopa()).toBe('');
  });

  it('servicio y mascota: la ropa del vestidor se guarda, se olvida y no sale en los íconos', async () => {
    const f = await montar(Mascota);
    const e = TestBed.inject(EstiloSumiService);
    e.aplicar({ ropa: 'heroe-rojo' });
    e.aplicar({ ropa: 'inventada' });
    expect(e.ropa()).toBe('heroe-rojo');
    expect(e.comoMapa().ropa).toBe('heroe-rojo');
    expect(e.personalizado()).toBe(true);
    await pintar(f);
    expect(f.componentInstance.clases()).toContain('sumi--sin-bufanda');

    f.componentRef.setInput('clasica', true);
    await pintar(f);
    expect(f.componentInstance.dibujoRopa()).toBe('');

    e.poner('ropa', 'camiseta-azul');
    expect(JSON.parse(localStorage.getItem('saesu-sumi-estilo')!).ropa).toBe('camiseta-azul');
    e.olvidar();
    expect(e.ropa()).toBe('ninguno');
  });

  it('vestidor: pestaña de ropa, probar, comprar y el resumen sin bufanda con traje', async () => {
    const f = await montar(VestidorSumi);
    await pintar(f);
    const c = f.componentInstance as any;
    c.cambiarPestana('ropa');
    await pintar(f);
    expect(c.prendas().length).toBe(401);
    expect(f.nativeElement.querySelectorAll('.vs__prenda').length).toBe(401);

    const traje = ROPAS.find(r => r.id === 'oficina-azul')!;
    c.elegir(traje);
    await pintar(f);
    expect(c.prueba('ropa')).toBe('oficina-azul');
    c.comprar();
    await pintar(f);
    expect(peticiones.find(p => p.url.endsWith('/vestidor/comprar'))?.cuerpo).toEqual({ categoria: 'ropa', prenda: 'oficina-azul' });
    const estilo = TestBed.inject(EstiloSumiService);
    expect(estilo.ropa()).toBe('oficina-azul');
    expect(c.lleva()).toContain('Traje de oficina azul');
    expect(c.lleva()).not.toContain('Bufanda');

    expect(c.textoMovimiento({ cantidad: -70, motivo: 'Compra en el vestidor: ropa oficina-azul', fecha: '' }))
      .toBe('Compraste «Traje de oficina azul»');
    c.elegir(ROPAS[0]);
    expect(estilo.ropa()).toBe('ninguno');
  }, 30000);

  it('disfraces: 93 de cuerpo entero con los mismos ids y precios que el backend (V29)', () => {
    expect(VARIANTES_DISFRACES).toHaveLength(93);
    expect(DISFRACES).toHaveLength(94);
    expect(DISFRACES[0].id).toBe('ninguno');
    expect(VARIANTES_DISFRACES.reduce((s, v) => s + v.precio, 0)).toBe(10410);
    expect(DISFRAZ_COMPLETO.size).toBe(93);
    expect(VARIANTES_DISFRACES.every(v => !!DIBUJOS_ROPA[v.id]?.mangas && !ROPAS.some(r => r.id === v.id))).toBe(true);
    expect(DISFRACES.find(d => d.id === 'dino-verde')!.nombre).toBe('Disfraz de dinosaurio verde');
    expect(DISFRACES.find(d => d.id === 'rana-dorada')!.nombre).toBe('Disfraz de rana dorada');
  });

  it('disfraces: tapan toda a Sumi menos la carita y se recuerdan', async () => {
    const f = await montar(Mascota);
    const e = TestBed.inject(EstiloSumiService);
    e.aplicar({ ropa: 'dino-verde', sombrero: 'gorra' });
    expect(e.ropa()).toBe('dino-verde');
    await pintar(f);
    const clases = f.componentInstance.clases();
    expect(clases).toContain('sumi--disfraz');
    expect(clases).toContain('sumi--sin-bufanda');
    f.componentRef.setInput('ropa', 'camiseta-azul');
    await pintar(f);
    expect(f.componentInstance.clases()).not.toContain('sumi--disfraz');
  });

  it('vestidor: pestaña de disfraces y resumen sin sombrero ni bufanda', async () => {
    const f = await montar(VestidorSumi);
    await pintar(f);
    const c = f.componentInstance as any;
    c.cambiarPestana('disfraces');
    await pintar(f);
    expect(c.prendas().length).toBe(94);
    c.elegir(DISFRACES.find(d => d.id === 'oso-pardo'));
    expect(c.prueba('disfraces')).toBe('oso-pardo');
    c.comprar();
    await pintar(f);
    const estilo = TestBed.inject(EstiloSumiService);
    expect(estilo.ropa()).toBe('oso-pardo');
    expect(c.lleva()).toBe('Disfraz de oso pardo');
    expect(c.textoMovimiento({ cantidad: -90, motivo: 'Compra en el vestidor: ropa oso-pardo', fecha: '' }))
      .toBe('Compraste «Disfraz de oso pardo»');
  }, 30000);
});
