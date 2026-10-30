import { afterEach, describe, expect, it } from 'vitest';
import { montar, pintar, limpiar, peticiones, errores } from './montar.testing';
import { PublicacionDetallePage } from '../features/docente/pages/publicacion-detalle/publicacion-detalle';
import { EstudiantesDocente } from '../features/docente/pages/estudiantes-docente/estudiantes-docente';
import { PreguntaForm } from '../features/docente/pages/pregunta-form/pregunta-form';
import { BancoPreguntas } from '../features/docente/pages/banco-preguntas/banco-preguntas';
import { ModeracionDocente } from '../features/docente/pages/moderacion-docente/moderacion-docente';
import { EstudianteDetallePage } from '../features/docente/pages/estudiante-detalle/estudiante-detalle';
import { PublicacionesDocente } from '../features/docente/pages/publicaciones-docente/publicaciones-docente';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = 'DOCENTE';

describe('Flujos del docente', () => {
  afterEach(limpiar);

  it('publicación: marcar oficial, quitarla, ocultar y responder', async () => {
    const f = await montar(PublicacionDetallePage, { params: { id: '1' } }, D);
    const c = f.componentInstance as any;
    c.marcarOficial(12);
    c.quitarOficial(10);
    c.ocultarRespuesta(12);
    c.responder('Revisa el exponente');
    c.responder('Respuesta anidada', 10);
    c.ocultarPublicacion();
    await pintar(f);
    errores.set(/oficial/, 500);
    c.marcarOficial(12);
    await pintar(f);
    expect(peticiones.filter(p => p.url.includes('/docente/')).length).toBeGreaterThan(4);
  });

  it('estudiantes: filtrar, ordenar, abrir y exportar', async () => {
    globalThis.URL.createObjectURL ??= (() => 'blob:x') as any;
    globalThis.URL.revokeObjectURL ??= (() => undefined) as any;
    const f = await montar(EstudiantesDocente, {}, D);
    const c = f.componentInstance as any;
    for (const filtro of ['todos', 'en-riesgo', 'nuevo', 'al-dia']) c.cambiarFiltro(filtro);
    for (const orden of ['nombre', 'puntos', 'porcentaje', 'ultima', 'puntos']) {
      c.ordenarPor(orden);
      expect(c.iconoOrden(orden)).toBeTypeOf('string');
    }
    await pintar(f);
    const e = { porTema: [{ tema: 'limites', intentos: 4 }] };
    expect(c.temaDe(e, 'limites')).toBeTruthy();
    c.abrir({ id: 2 });
    c.exportar();
    await pintar(f);
    expect(peticiones.some(p => p.url.endsWith('/exportar'))).toBe(true);
  });

  it('formulario de pregunta: validar, crear y editar', async () => {
    const nueva = await montar(PreguntaForm, {}, D);
    const c = nueva.componentInstance as any;
    c.guardar();
    c.enunciado.set('Deriva f(x) = 3x²');
    c.pista.set('Baja el exponente');
    for (const l of ['A', 'B', 'C', 'D']) c.cambiarTexto(l, 'Opción ' + l);
    c.correcta.set('A');
    c.guardar();
    await pintar(nueva);
    expect(peticiones.some(p => p.metodo === 'POST' && p.url.endsWith('/docente/preguntas'))).toBe(true);
    limpiar();
    (await import('@angular/core/testing')).TestBed.resetTestingModule();
    const editar = await montar(PreguntaForm, { params: { id: '7' } }, D);
    const e = editar.componentInstance as any;
    errores.set(/docente\/preguntas\/7$/, 409);
    e.guardar();
    await pintar(editar);
    e.guardar();
    await pintar(editar);
    expect(peticiones.some(p => p.metodo === 'PUT')).toBe(true);
  });

  it('banco de preguntas: buscar, filtrar, ver detalle y desactivar', async () => {
    const f = await montar(BancoPreguntas, {}, D);
    const c = f.componentInstance as any;
    c.buscarConPausa('pregunta');
    c.cambiarEstadoFiltro('activas');
    c.cambiarEstadoFiltro('inactivas');
    c.cambiarEstadoFiltro('todas');
    c.alternarDetalle(7);
    c.alternarDetalle(7);
    c.alternarActiva({ id: 7, activa: true }, { stopPropagation() {} } as any);
    c.cargar();
    await pintar(f);
    expect(peticiones.some(p => p.metodo === 'PATCH')).toBe(true);
  });

  it('moderación: restaurar contenido', async () => {
    const f = await montar(ModeracionDocente, {}, D);
    const c = f.componentInstance as any;
    c.restaurar({ tipo: 'PUBLICACION', id: 1 });
    c.restaurar({ tipo: 'RESPUESTA', id: 12 });
    expect(c.clave({ tipo: 'RESPUESTA', id: 12 })).toContain('12');
    await pintar(f);
    expect(peticiones.filter(p => p.metodo === 'DELETE').length).toBe(2);
  });

  it('detalle del estudiante: ver un quiz', async () => {
    const f = await montar(EstudianteDetallePage, { params: { id: '2' } }, D);
    const c = f.componentInstance as any;
    c.verQuiz(9);
    await pintar(f);
    expect(c.avance(5, 10)).toBe(50);
    expect(c.avance(0, 0)).toBe(0);
  });

  it('publicaciones pendientes', async () => {
    const f = await montar(PublicacionesDocente, {}, D);
    const c = f.componentInstance as any;
    expect(c.estado({ respuestasCount: 0, fechaCreacion: '2026-10-01T00:00:00' })).toBeTruthy();
    c.abrir({ id: 1 });
    c.cargar();
    await pintar(f);
  });
});
