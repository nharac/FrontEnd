import { afterEach, describe, expect, it } from 'vitest';
import { montar, texto, limpiar, peticiones } from './montar.testing';
import { DashboardEstudiante } from '../features/practica/pages/dashboard-estudiante/dashboard-estudiante';
import { DashboardPractica } from '../features/practica/pages/dashboard-practica/dashboard-practica';
import { ChatTutor } from '../features/chat/pages/chat-tutor/chat-tutor';
import { ListaPublicaciones } from '../features/foro/pages/lista-publicaciones/lista-publicaciones';
import { NuevaPublicacion } from '../features/foro/pages/nueva-publicacion/nueva-publicacion';
import { VerPublicacion } from '../features/foro/pages/ver-publicacion/ver-publicacion';
import { Perfil } from '../features/usuario/pages/perfil/perfil';
import { Ranking } from '../features/gamificacion/pages/ranking/ranking';
import { Quiz } from '../features/quiz/pages/quiz/quiz';
import { MainLayout } from '../layout/main-layout/main-layout';

describe('Pantallas del estudiante', () => {
  afterEach(limpiar);

  it('inicio del estudiante muestra su progreso', async () => {
    const f = await montar(DashboardEstudiante);
    expect(peticiones.some(p => p.url.endsWith('/practica/progreso'))).toBe(true);
    expect(texto(f).length).toBeGreaterThan(0);
  });

  it('práctica carga preguntas', async () => {
    const f = await montar(DashboardPractica, { query: { tema: 'derivadas' } });
    expect(f.componentInstance).toBeTruthy();
  });

  it('chat con el tutor carga el historial', async () => {
    const f = await montar(ChatTutor);
    expect(texto(f)).toContain('Claro');
  });

  it('foro lista publicaciones', async () => {
    const f = await montar(ListaPublicaciones);
    expect(texto(f)).toContain('Límite lateral 1');
  });

  it('nueva publicación', async () => {
    const f = await montar(NuevaPublicacion);
    expect(f.componentInstance).toBeTruthy();
  });

  it('ver publicación con respuestas anidadas', async () => {
    const f = await montar(VerPublicacion, { params: { id: '1' } });
    expect(texto(f)).toContain('¿Cómo derivo x²?');
    expect(texto(f)).toContain('regla de la potencia');
  });

  it('perfil', async () => {
    const f = await montar(Perfil);
    expect(texto(f)).toContain('Ana');
  });

  it('ranking', async () => {
    const f = await montar(Ranking);
    expect(texto(f)).toContain('Estudiante 1');
  });

  it('quiz muestra el historial', async () => {
    const f = await montar(Quiz);
    expect(peticiones.some(p => p.url.endsWith('/quiz/historial'))).toBe(true);
    expect(f.componentInstance).toBeTruthy();
  });

  it('layout del estudiante', async () => {
    const f = await montar(MainLayout);
    expect(f.componentInstance).toBeTruthy();
  });
});
