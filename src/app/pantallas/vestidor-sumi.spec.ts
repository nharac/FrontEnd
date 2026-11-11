import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { montar, pintar, limpiar, peticiones, errores } from './montar.testing';

import {
  BUFANDAS, CARAS, ESPALDAS, EstiloSumiService, FONDOS, OBJETOS, SOMBREROS
} from '../core/services/estilo-sumi.service';
import { BUFANDAS_VARIANTES, VARIANTES } from '../shared/components/mascota/sumi-variantes';
import { DIBUJOS_CABEZA, DIBUJOS_CARA, DIBUJOS_ESPALDA, DIBUJOS_FONDO, DIBUJOS_MANO } from '../shared/components/mascota/sumi-prendas';
import { Mascota } from '../shared/components/mascota/mascota';
import { TiendaSumiService } from '../features/gamificacion/services/tienda-sumi.service';
import { TokenService } from '../core/services/token.service';
import { VestidorSumi } from '../features/gamificacion/components/vestidor-sumi/vestidor-sumi';
import { PerfilDocente } from '../features/docente/pages/perfil-docente/perfil-docente';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('Vestidor de Sumi', () => {
  afterEach(() => { limpiar(); vi.useRealTimers(); });

  it('catálogo: cada prenda tiene su dibujo y no hay repetidas', () => {
    const conDibujo = (lista: { id: string }[], dibujos: Record<string, unknown>) =>
      lista.filter(p => p.id !== 'ninguno').every(p => !!dibujos[p.id]);
    expect(conDibujo(SOMBREROS, DIBUJOS_CABEZA)).toBe(true);
    expect(conDibujo(CARAS, DIBUJOS_CARA)).toBe(true);
    expect(conDibujo(OBJETOS, DIBUJOS_MANO)).toBe(true);
    expect(conDibujo(ESPALDAS, DIBUJOS_ESPALDA)).toBe(true);
    expect(conDibujo(FONDOS, DIBUJOS_FONDO)).toBe(true);
    expect(BUFANDAS.every(b => b.colores.length >= 4)).toBe(true);
    const total = SOMBREROS.length + CARAS.length + OBJETOS.length + ESPALDAS.length + BUFANDAS.length + FONDOS.length;
    expect(total).toBe(787);
    for (const lista of [SOMBREROS, CARAS, OBJETOS, ESPALDAS, BUFANDAS, FONDOS]) {
      expect(new Set(lista.map(p => p.id)).size).toBe(lista.length);
    }
  });

  it('servicio: recuerda el estilo, ignora valores raros y vuelve al de siempre', () => {
    localStorage.setItem('saesu_token', 'token-falso');
    localStorage.setItem('saesu-sumi-estilo', JSON.stringify({ sombrero: 'corona', cara: 'sol', objeto: 'pc', espalda: 'capa', fondo: 'playa', bufanda: 'oro' }));
    let e = TestBed.inject(EstiloSumiService);
    expect([e.sombrero(), e.cara(), e.objeto(), e.espalda(), e.fondo(), e.bufanda()]).toEqual(['corona', 'sol', 'pc', 'capa', 'playa', 'oro']);
    expect(e.personalizado()).toBe(true);
    e.restablecer();
    expect(e.personalizado()).toBe(false);
    expect(JSON.parse(localStorage.getItem('saesu-sumi-estilo')!))
      .toEqual({ sombrero: 'ninguno', cara: 'ninguno', ropa: 'ninguno', objeto: 'ninguno', espalda: 'ninguno', fondo: 'ninguno', bufanda: 'saesu' });

    TestBed.resetTestingModule();
    localStorage.setItem('saesu_token', 'token-falso');
    localStorage.setItem('saesu-sumi-estilo', '{"sombrero":"capa","bufanda":7}');
    e = TestBed.inject(EstiloSumiService);
    expect(e.sombrero()).toBe('ninguno');
    expect(e.bufanda()).toBe('saesu');

    TestBed.resetTestingModule();
    localStorage.setItem('saesu-sumi-estilo', 'dañado');
    expect(TestBed.inject(EstiloSumiService).bufanda()).toBe('saesu');
  });

  it('sesión: sin sesión Sumi sale clásica aunque haya una copia guardada', () => {
    localStorage.removeItem('saesu_token');
    localStorage.setItem('saesu-sumi-estilo', JSON.stringify({ sombrero: 'corona', bufanda: 'oro' }));
    const e = TestBed.inject(EstiloSumiService);
    expect(e.personalizado()).toBe(false);
  });

  it('sesión: al cerrar sesión Sumi vuelve a su forma clásica y se olvida la cuenta', async () => {
    await montar(Mascota);
    const estilo = TestBed.inject(EstiloSumiService);
    const tienda = TestBed.inject(TiendaSumiService);
    tienda.cargar().subscribe();
    await new Promise(r => setTimeout(r));
    estilo.poner('fondo', 'playa');
    expect(estilo.personalizado()).toBe(true);
    expect(tienda.monedas()).toBe(80);

    TestBed.inject(TokenService).eliminar();

    expect(estilo.personalizado()).toBe(false);
    expect(localStorage.getItem('saesu-sumi-estilo')).toBeNull();
    expect(tienda.monedas()).toBe(0);
    expect(tienda.cargado()).toBe(false);
    expect(tienda.inventario().size).toBe(0);

    // Si la respuesta del servidor llega después de cerrar sesión, no se aplica
    tienda.cargar().subscribe();
    await new Promise(r => setTimeout(r));
    expect(estilo.sombrero()).toBe('ninguno');
    expect(tienda.monedas()).toBe(0);
  });

  it('servicio: sin localStorage no se rompe', () => {
    const e = TestBed.inject(EstiloSumiService);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('lleno'); });
    e.poner('sombrero', 'gorra');
    expect(e.sombrero()).toBe('gorra');
  });

  it('mascota: dibuja solo lo que lleva puesto', async () => {
    const f = await montar(Mascota);
    const el = f.nativeElement as HTMLElement;
    const piezas = () => ['espalda', 'frente', 'cara', 'cabeza', 'mano']
      .map(n => el.querySelector(`.sumi__vestidor-${n}`)!.childElementCount);
    expect(piezas()).toEqual([0, 0, 0, 0, 0]);

    const e = TestBed.inject(EstiloSumiService);
    e.poner('sombrero', 'vikingo');
    e.poner('cara', 'bigote');
    e.poner('objeto', 'arepa');
    e.poner('espalda', 'mochila');
    e.poner('bufanda', 'nieve');
    await pintar(f);
    expect(piezas().every(n => n > 0)).toBe(true);
    expect(el.className).toContain('sumi--sin-flor');
    expect(el.className).toContain('sumi--con-objeto');
    expect(el.style.getPropertyValue('--sumi-buf-base')).toBe('#f8fafc');
    expect(el.style.getPropertyValue('--sumi-buf-texto')).toBe('#ef4444');

    // El moño deja ver la flor; el birrete y las gafas del módulo mandan sobre el vestidor
    f.componentRef.setInput('sombrero', 'mono');
    await pintar(f);
    expect(el.className).not.toContain('sumi--sin-flor');
    f.componentRef.setInput('accesorio', 'birrete');
    await pintar(f);
    expect(piezas()[3]).toBe(0);
    f.componentRef.setInput('accesorio', 'gafas');
    await pintar(f);
    expect(piezas()[2]).toBe(0);

    // El fondo solo aparece donde se pide (Sumi grande) y cada Sumi tiene su propio recorte
    e.poner('fondo', 'espacio');
    await pintar(f);
    expect(el.querySelector('.sumi__fondo')).toBeNull();
    f.componentRef.setInput('conFondo', true);
    await pintar(f);
    const recorte = el.querySelector('clipPath')!.id;
    expect(el.querySelector('.sumi__fondo')!.getAttribute('clip-path')).toBe(`url(#${recorte})`);
    expect(el.className).toContain('sumi--con-fondo');

    // Una segunda Sumi igual reutiliza el dibujo ya interpretado
    const g = TestBed.createComponent(Mascota);
    g.detectChanges();
    expect(g.nativeElement.querySelector('.sumi__vestidor-cabeza').childElementCount).toBeGreaterThan(0);
  });

  it('catálogo: las 500 variantes tienen los mismos ids y precios que el backend (V26)', () => {
    const variantes = [...VARIANTES.cabeza, ...VARIANTES.cara, ...VARIANTES.mano, ...VARIANTES.espalda, ...VARIANTES.fondo];
    const precios = variantes.reduce((s, v) => s + v.precio, 0) + BUFANDAS_VARIANTES.reduce((s, b) => s + b[2], 0);
    expect(variantes.length + BUFANDAS_VARIANTES.length).toBe(500);
    expect(precios).toBe(15460);
    expect(SOMBREROS.find(p => p.id === 'copa-azul')!.nombre).toBe('Sombrero de copa con cinta azul');
    expect(SOMBREROS.find(p => p.id === 'gorro-dorado')!.precio).toBe(25);
    expect(BUFANDAS.find(b => b.id === 'amarillo-morado')!.colores).toHaveLength(5);
    expect(SOMBREROS[0].id).toBe('ninguno');
  });

  it('catálogo: precios en Sumi Monedas y unas cuantas prendas gratis', () => {
    const todas = [...SOMBREROS, ...CARAS, ...OBJETOS, ...ESPALDAS, ...BUFANDAS, ...FONDOS];
    expect(todas.every(p => p.precio >= 0 && p.precio % 5 === 0)).toBe(true);
    expect(Math.max(...todas.map(p => p.precio))).toBe(520);
    expect(todas.filter(p => p.precio === 0).length).toBeGreaterThan(6);
  });

  it('servicio: aplica estilos del servidor y los devuelve como mapa', () => {
    const e = TestBed.inject(EstiloSumiService);
    e.aplicar({ sombrero: 'chef', fondo: 'playa', cara: 'nada-raro' as any });
    expect(e.comoMapa()).toEqual({ sombrero: 'chef', cara: 'ninguno', ropa: 'ninguno', objeto: 'ninguno', espalda: 'ninguno', bufanda: 'saesu', fondo: 'playa' });
    expect(JSON.parse(localStorage.getItem('saesu-sumi-estilo')!).sombrero).toBe('chef');
  });

  it('tienda: carga, compra, viste y trae el historial', async () => {
    await montar(Mascota);
    const tienda = TestBed.inject(TiendaSumiService);
    const estilo = TestBed.inject(EstiloSumiService);
    tienda.cargar().subscribe();
    await new Promise(r => setTimeout(r));
    expect(tienda.monedas()).toBe(80);
    expect(tienda.cargado()).toBe(true);
    expect(estilo.sombrero()).toBe('gorra');
    expect(tienda.tiene('sombrero', SOMBREROS.find(p => p.id === 'gorra')!)).toBe(true);
    expect(tienda.tiene('sombrero', SOMBREROS.find(p => p.id === 'corona')!)).toBe(false);
    expect(tienda.tiene('sombrero', SOMBREROS.find(p => p.id === 'gorro')!)).toBe(true);

    estilo.poner('sombrero', 'chef');
    tienda.comprar('fondo', 'playa').subscribe();
    await new Promise(r => setTimeout(r));
    expect(tienda.monedas()).toBe(30);
    expect(estilo.sombrero()).toBe('chef'); // comprar no cambia lo que lleva puesto
    tienda.vestir().subscribe();
    await new Promise(r => setTimeout(r));
    expect(peticiones.find(p => p.metodo === 'PUT')?.cuerpo).toEqual(expect.objectContaining({ sombrero: 'chef' }));
    let movs: unknown[] = [];
    tienda.historial().subscribe(m => movs = m);
    await new Promise(r => setTimeout(r));
    expect(movs.length).toBe(2);
  });

  it('vestidor: ponerse lo que tiene, probar y comprar con Sumi Monedas', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const f = await montar(VestidorSumi);
    await pintar(f);
    const c = f.componentInstance as any;
    const estilo = TestBed.inject(EstiloSumiService);
    const tienda = TestBed.inject(TiendaSumiService);
    const boton = (nombre: string) => ([...f.nativeElement.querySelectorAll('.vs__prenda')] as HTMLButtonElement[])
      .find(b => b.querySelector('.vs__nombre')!.textContent!.trim() === nombre)!;
    const ir = async (t: string) => { c.cambiarPestana(t); await pintar(f); };

    expect(f.nativeElement.querySelector('.vs__saldo')!.textContent).toContain('80');
    expect(c.conteo()).toEqual({ tiene: SOMBREROS.filter(p => p.precio === 0).length + 1, total: SOMBREROS.length });

    // Lo que ya tiene: se pone y se guarda en el servidor
    boton('Gorro de lana').click();
    await pintar(f);
    expect(estilo.sombrero()).toBe('gorro');
    expect(c.saluda()).toBe(true);
    vi.advanceTimersByTime(2300);
    expect(c.saluda()).toBe(false);
    expect(peticiones.some(p => p.metodo === 'PUT' && /vestidor\/estilo$/.test(p.url))).toBe(true);

    // Lo que no tiene: primero se prueba (Sumi grande la muestra) y luego se compra
    boton('Gorro de chef').click();
    await pintar(f);
    expect(c.probando().prenda.id).toBe('chef');
    expect(c.prueba('sombreros')).toBe('chef');
    expect(c.prueba('caras')).toBeNull();
    expect(estilo.sombrero()).toBe('gorro');
    expect(c.aviso()).toContain('¿Te la llevas por 25');
    const comprar = f.nativeElement.querySelector('.vs__comprar') as HTMLButtonElement;
    expect(comprar.disabled).toBe(false);
    comprar.click();
    c.comprar(); // mientras compra no se compra dos veces
    await pintar(f);
    expect(peticiones.filter(p => /comprar$/.test(p.url)).length).toBe(1);
    expect(peticiones.find(p => /comprar$/.test(p.url))?.cuerpo).toEqual({ categoria: 'sombrero', prenda: 'chef' });
    expect(estilo.sombrero()).toBe('chef');
    expect(c.aviso()).toContain('Compraste');
    expect(c.probando()).toBeNull();
    expect(tienda.monedas()).toBe(30);

    // Muy cara: dice cuánto falta y no deja comprar
    boton('Corona').click();
    await pintar(f);
    expect(c.faltan(c.probando().prenda)).toBe(270);
    expect((f.nativeElement.querySelector('.vs__comprar') as HTMLButtonElement).disabled).toBe(true);
    expect(f.nativeElement.querySelector('.vs__faltan')).not.toBeNull();
    (f.nativeElement.querySelector('.vs__compra .vs__mini') as HTMLButtonElement).click();
    expect(c.probando()).toBeNull();

    // Si el servidor rechaza la compra, se avisa
    errores.set(/comprar$/, 409);
    boton('Gorro de dormir').click();
    c.comprar();
    await pintar(f);
    expect(c.aviso()).not.toBe('');
    expect(c.comprando()).toBe(false);
    errores.clear();
    c.dejarDeProbar();
    const antes = peticiones.length;
    c.comprar(); // sin nada probándose no hace nada
    expect(peticiones.length).toBe(antes);

    // Cambiar de pestaña quita la prueba; "Solo las que tengo" esconde la tienda
    await ir('fondos');
    expect(c.probando()).toBeNull();
    c.soloMias.set(true);
    await pintar(f);
    expect(f.nativeElement.querySelectorAll('.vs__prenda--tienda').length).toBe(0);
    c.soloMias.set(false);
    boton('Sin fondo').click();
    expect(c.aviso()).toBe('Listo, sin fondo.');

    // Si el servidor no acepta el estilo, vuelve a lo guardado
    errores.set(/vestidor\/estilo$/, 409);
    c.sorprender();
    await pintar(f);
    expect(peticiones.filter(p => p.metodo === 'GET' && /sumi\/vestidor$/.test(p.url)).length).toBeGreaterThan(0);
    errores.clear();
    c.restablecer();
    expect(c.aviso()).toContain('estilo de siempre');

    // Ayuda: reglas y últimos movimientos
    const ayuda = f.nativeElement.querySelector('.vs__ayuda') as HTMLDetailsElement;
    ayuda.open = true;
    c.abrirAyuda({ target: ayuda });
    await pintar(f);
    expect(f.nativeElement.querySelectorAll('.vs__reglas li').length).toBe(5);
    expect(f.nativeElement.querySelectorAll('.vs__movs li').length).toBe(2);
    expect(f.nativeElement.querySelector('.vs__gasto')).not.toBeNull();
    expect(f.nativeElement.querySelector('.vs__movs')!.textContent).toContain('Compraste «Gorra SAESU»');
    expect(c.textoMovimiento({ cantidad: -5, motivo: 'Compra en el vestidor: sombrero inventado', fecha: '' })).toContain('inventado');
  }, 20000); // recorre todo el vestidor (con 700+ prendas)

  it('vestidor: avisa si no puede traer las monedas', async () => {
    errores.set(/sumi\/vestidor$/, 500);
    const f = await montar(VestidorSumi);
    await pintar(f);
    expect((f.componentInstance as any).aviso()).toContain('No pude traer');
  });

  it('docente: todo gratis en su perfil', async () => {
    const f = await montar(PerfilDocente, {}, 'DOCENTE');
    await pintar(f);
    const v = f.nativeElement.querySelector('app-vestidor-sumi') as HTMLElement;
    expect(v.querySelector('.vs__saldo--docente')).not.toBeNull();
    expect(v.querySelectorAll('.vs__prenda--tienda').length).toBe(0);
    expect(v.querySelector('.vs__solo')).toBeNull();
    expect(v.querySelector('.vs__ayuda')).toBeNull();
  });
});
