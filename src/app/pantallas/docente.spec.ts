import { afterEach, describe, expect, it } from 'vitest';
import { montar, texto, limpiar } from './montar.testing';
import { DashboardDocente } from '../features/docente/pages/dashboard-docente/dashboard-docente';
import { EstudiantesDocente } from '../features/docente/pages/estudiantes-docente/estudiantes-docente';
import { ModeracionDocente } from '../features/docente/pages/moderacion-docente/moderacion-docente';
import { EstadisticasDocente } from '../features/docente/pages/estadisticas-docente/estadisticas-docente';
import { BancoPreguntas } from '../features/docente/pages/banco-preguntas/banco-preguntas';
import { EstudianteDetallePage } from '../features/docente/pages/estudiante-detalle/estudiante-detalle';
import { PublicacionDetallePage } from '../features/docente/pages/publicacion-detalle/publicacion-detalle';
import { PublicacionesDocente } from '../features/docente/pages/publicaciones-docente/publicaciones-docente';
import { PreguntaForm } from '../features/docente/pages/pregunta-form/pregunta-form';
import { DocenteLayout } from '../layout/docente-layout/docente-layout';

describe('Pantallas del docente', () => {
  afterEach(limpiar);
  const D = 'DOCENTE';

  it('inicio del docente', async () => {
    const f = await montar(DashboardDocente, {}, D);
    expect(texto(f)).toContain('Límite lateral 1');
  });
  it('estudiantes con sus estados', async () => {
    const f = await montar(EstudiantesDocente, { query: { filtro: 'en-riesgo' } }, D);
    expect(texto(f)).toContain('Estudiante 2');
  });
  it('moderación', async () => {
    const f = await montar(ModeracionDocente, {}, D);
    expect(texto(f)).toContain('Spam');
  });
  it('estadísticas', async () => {
    const f = await montar(EstadisticasDocente, {}, D);
    expect(texto(f)).toContain('sen(x²)');
  });
  it('banco de preguntas', async () => {
    const f = await montar(BancoPreguntas, {}, D);
    expect(texto(f)).toContain('Pregunta 7');
  });
  it('detalle de un estudiante', async () => {
    const f = await montar(EstudianteDetallePage, { params: { id: '2' } }, D);
    expect(texto(f)).toContain('Estudiante 2');
  });
  it('detalle de una publicación', async () => {
    const f = await montar(PublicacionDetallePage, { params: { id: '1' } }, D);
    expect(texto(f)).toContain('¿Cómo derivo x²?');
  });
  it('publicaciones pendientes y todas', async () => {
    const f = await montar(PublicacionesDocente, { data: { modo: 'todas' } }, D);
    expect(texto(f)).toContain('Límite lateral');
  });
  it('formulario para editar una pregunta', async () => {
    const f = await montar(PreguntaForm, { params: { id: '7' } }, D);
    expect(f.componentInstance).toBeTruthy();
  });
  it('layout del docente', async () => {
    const f = await montar(DocenteLayout, {}, D);
    expect(f.componentInstance).toBeTruthy();
  });
});
