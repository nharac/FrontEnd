import { afterEach, describe, expect, it } from 'vitest';
import { montar, pintar, limpiar } from './montar.testing';
import { Perfil } from '../features/usuario/pages/perfil/perfil';

/* eslint-disable @typescript-eslint/no-explicit-any */
const logro = (codigo: string, categoria: string, rareza: string, obtenido = true) =>
  ({ codigo, nombre: codigo, descripcion: '', icono: 'star', categoria, rareza, obtenido, fechaObtenido: null, progreso: 1, meta: 1, secreto: false });

describe('Cabecera del perfil', () => {
  afterEach(limpiar);

  it('muestra el puesto del ranking y las insignias junto al rol (retos primero)', async () => {
    const f = await montar(Perfil);
    const c = f.componentInstance as any;
    await pintar(f);

    c.logros.set([
      logro('COMUN_1', 'PRACTICA', 'COMUN'),
      logro('EPICO_1', 'TEMAS', 'EPICO'),
      logro('RETO_1', 'RETOS', 'LEGENDARIO'),
      logro('SIN', 'PRACTICA', 'RARO', false),
      logro('DESARROLLADOR', 'RETOS', 'EXCLUSIVO'),
      ...[1, 2, 3, 4, 5].map(i => logro('R' + i, 'PRACTICA', 'RARO')),
    ]);
    expect(c.insigniasObtenidas().map((l: any) => l.codigo).slice(0, 2)).toEqual(['RETO_1', 'EPICO_1']);
    expect(c.insigniasCabecera().length).toBe(6);
    expect(c.insigniasRestantes()).toBe(2);

    c.miPosicion.set({ periodo: 'total', posicion: 14, puntos: 50, participantes: 40, puntosParaSubir: 5, siguienteNombre: 'Leo' });
    expect(c.puesto()).toBe(c.miLugar() ?? 14);
    await pintar(f);
    expect(f.nativeElement.querySelector('.cabecera__insignias')).not.toBeNull();
    expect(f.nativeElement.textContent).toContain('+2');

    const ev = { preventDefault() {} } as Event;
    c.irAColeccion(ev);
  });
});
