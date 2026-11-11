import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { montar, pintar, limpiar, peticiones, errores } from './montar.testing';

import { TemaService } from '../core/services/tema.service';
import { BotonTema } from '../shared/components/boton-tema/boton-tema';
import { NoEncontrada } from '../shared/components/no-encontrada/no-encontrada';
import { Ranking, guardarPuestos, leerPuestos } from '../features/gamificacion/pages/ranking/ranking';
import { DashboardPractica } from '../features/practica/pages/dashboard-practica/dashboard-practica';
import { ChatPanel, leerFijadas } from '../features/chat/components/chat-panel/chat-panel';
import { ListaPublicaciones } from '../features/foro/pages/lista-publicaciones/lista-publicaciones';
import { NuevaPublicacion } from '../features/foro/pages/nueva-publicacion/nueva-publicacion';
import { VerPublicacion } from '../features/foro/pages/ver-publicacion/ver-publicacion';
import { UtilesService } from '../features/foro/services/utiles.service';
import { PublicacionesDocente } from '../features/docente/pages/publicaciones-docente/publicaciones-docente';
import { EstadisticasDocente, intentosPorDiaSemana } from '../features/docente/pages/estadisticas-docente/estadisticas-docente';
import { BancoPreguntas } from '../features/docente/pages/banco-preguntas/banco-preguntas';
import { LoginForm, guardarRecordado, leerRecordado } from '../features/usuario/pages/auth/login-form/login-form';
import { Quiz } from '../features/quiz/pages/quiz/quiz';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('Mejoras de interfaz', () => {
  afterEach(() => {
    limpiar();
    document.documentElement.classList.remove('tema-oscuro');
    document.body.classList.remove('modo-enfoque');
    vi.unstubAllGlobals();
  });

  it('modo oscuro: alterna, se guarda y respeta la preferencia del sistema', () => {
    localStorage.removeItem('saesu-tema');
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const tema = TestBed.inject(TemaService);
    expect(tema.oscuro()).toBe(true);
    expect(document.documentElement.classList.contains('tema-oscuro')).toBe(true);
    tema.alternar();
    expect(tema.oscuro()).toBe(false);
    expect(localStorage.getItem('saesu-tema')).toBe('claro');

    const f = TestBed.createComponent(BotonTema);
    f.detectChanges();
    (f.nativeElement.querySelector('button') as HTMLButtonElement).click();
    f.detectChanges();
    expect(f.nativeElement.querySelector('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('404: Sumi perdida lleva al inicio según la sesión', async () => {
    const f = await montar(NoEncontrada);
    expect(f.nativeElement.textContent).toContain('Me perdí');
    expect((f.componentInstance as any).destino).toBe('/dashboard');
    localStorage.removeItem('saesu_token');
    const g = TestBed.createComponent(NoEncontrada);
    expect((g.componentInstance as any).destino).toBe('/auth');
  });

  it('ranking: flechas de subida y bajada frente a la visita anterior', async () => {
    guardarPuestos('semana', [{ usuarioId: 1 } as any, { usuarioId: 2 } as any]);
    expect(leerPuestos('semana')).toEqual({ 1: 1, 2: 2 });
    localStorage.setItem('saesu-ranking-puestos-semana', 'roto');
    expect(leerPuestos('semana')).toEqual({});

    localStorage.setItem('saesu-ranking-puestos-semana', JSON.stringify({ 4: 3, 5: 1 }));
    localStorage.setItem('saesu-ranking-periodo', 'semana');
    const f = await montar(Ranking);
    const c = f.componentInstance as any;
    await pintar(f);
    expect(c.cambio({ usuarioId: 4 }, 1)).toBe(2);
    expect(c.cambio({ usuarioId: 5 }, 2)).toBe(-1);
    expect(c.cambio({ usuarioId: 99 }, 4)).toBeNull();
  });

  it('quiz: el reloj pasa a ámbar con la cuarta parte del tiempo', async () => {
    const f = await montar(Quiz);
    const c = f.componentInstance as any;
    expect(typeof c.medio()).toBe('boolean');
  });

  it('práctica: modo enfoque y repasar los errores', async () => {
    const f = await montar(DashboardPractica);
    const c = f.componentInstance as any;
    await pintar(f);
    c.elegirTema('limites');
    c.empezar();
    await pintar(f);
    expect(c.vista()).toBe('sesion');
    c.enfoque.set(true);
    await pintar(f);
    expect(document.body.classList.contains('modo-enfoque')).toBe(true);

    c.repasarErrores(); // sin errores no hace nada
    c.alAcertar({ primerIntento: false, puntos: 0, logros: [] });
    expect(c.errores().length).toBe(1);
    c.repasarErrores();
    expect(c.repasando()).toBe(true);
    expect(c.preguntas().length).toBe(1);
    f.destroy();
    expect(document.body.classList.contains('modo-enfoque')).toBe(false);
  });

  it('chat: fijar respuestas y atajos para seguir', async () => {
    localStorage.setItem('saesu-chat-fijadas', '{');
    expect(leerFijadas()).toEqual([]);
    localStorage.removeItem('saesu-chat-fijadas');
    const f = await montar(ChatPanel);
    const c = f.componentInstance as any;
    await pintar(f);
    const m = { id: 5, rolEmisor: 'ia', mensaje: 'Usa $x^2$', preguntaId: null, fechaHora: new Date().toISOString() };
    c.alternarFijada(m);
    expect(c.estaFijada(m)).toBe(true);
    expect(leerFijadas()[0].id).toBe(5);
    c.verFijadas.set(true);
    await pintar(f);
    c.alternarFijada(m);
    expect(c.fijadas()).toEqual([]);
    expect(c.seguimientos.length).toBe(4);
  });

  it('foro: filtros rápidos, fórmulas en la vista previa y "Me sirvió"', async () => {
    const f = await montar(ListaPublicaciones);
    const c = f.componentInstance as any;
    await pintar(f);
    c.vista.set('mias');
    expect(c.visibles().length).toBe(c.mias());
    c.vista.set('sin');
    await pintar(f);
    expect(c.visibles().every((p: any) => !p.respuestasCount)).toBe(true);
  });

  it('foro: vista previa con fórmulas', async () => {
    const n = await montar(NuevaPublicacion);
    const cn = n.componentInstance as any;
    cn.form.patchValue({ contenido: 'Derivé $x^2$ y me dio $2x$' });
    await pintar(n);
    expect(cn.tieneFormulas()).toBe(true);
    expect(n.nativeElement.querySelector('.fo-form__tex')).not.toBeNull();
  });

  it('foro: "Me sirvió" en las respuestas', async () => {
    const v = await montar(VerPublicacion, { params: { id: '1' } });
    await pintar(v);
    const utiles = TestBed.inject(UtilesService);
    expect(utiles.mias().has(11)).toBe(true);
    expect(utiles.conteos()[11]).toBe(2);
    utiles.alternar(11);
    utiles.alternar(11); // mientras procesa se ignora
    await pintar(v);
    expect(utiles.mias().has(11)).toBe(false);
    expect(v.nativeElement.querySelector('.accion--util')).not.toBeNull();
    errores.set(/respuestas\/\d+\/util$/, 500);
    utiles.alternar(12);
    errores.set(/utiles$/, 500);
    utiles.cargar(1);
    expect(utiles.procesando()).toBeNull();
  });

  it('docente: responder desde la lista', async () => {
    const f = await montar(PublicacionesDocente, {}, 'DOCENTE');
    const c = f.componentInstance as any;
    await pintar(f);
    const p = c.publicaciones()[0];
    c.abrirRapida(p.id);
    c.responderRapido(p); // vacío: no hace nada
    c.textoRapido.set('Factoriza el numerador');
    c.responderRapido(p);
    await pintar(f);
    expect(peticiones.some((x: any) => /respuestas\/\d+\/oficial$/.test(x.url))).toBe(true);
    expect(c.publicaciones().some((x: any) => x.id === p.id)).toBe(false);
    errores.set(/foro\/publicaciones\/\d+\/respuestas$/, 500);
    const otra = c.publicaciones()[0];
    c.abrirRapida(otra.id); c.textoRapido.set('Hola profe'); c.responderRapido(otra);
  });

  it('docente: días de la semana y PDF de estadísticas', async () => {
    const dias = intentosPorDiaSemana([{ fecha: '2026-11-02', intentos: 4 }, { fecha: '2026-11-09', intentos: 2 }, { fecha: '2026-11-07', intentos: 1 }]);
    expect(dias[0]).toMatchObject({ nombre: 'Lun', intentos: 6, esMax: true, alto: 100 });
    expect(dias[5].intentos).toBe(1);
    expect(intentosPorDiaSemana([]).every(d => d.alto === 4)).toBe(true);

    const e = await montar(EstadisticasDocente, {}, 'DOCENTE');
    const ce = e.componentInstance as any;
    await pintar(e);
    const imprimir = vi.fn();
    vi.stubGlobal('print', imprimir);
    ce.imprimir();
    expect(imprimir).toHaveBeenCalled();
    expect(ce.mejorDia()).toBeTruthy();
  });

  it('docente: matriz del banco por tema y dificultad', async () => {
    const b = await montar(BancoPreguntas, {}, 'DOCENTE');
    const cb = b.componentInstance as any;
    await pintar(b);
    expect(cb.matriz().length).toBe(3);
    cb.filtrarMatriz('limites', 'basico');
    expect(cb.tema()).toBe('limites');
  });

  it('acceso: recordar el correo y saludar por el nombre', async () => {
    guardarRecordado({ correo: 'ana@ucundinamarca.edu.co', nombre: 'Ana' });
    expect(leerRecordado()?.nombre).toBe('Ana');
    const f = await montar(LoginForm);
    const c = f.componentInstance as any;
    await pintar(f);
    expect(f.nativeElement.textContent).toContain('¡Hola de nuevo, Ana!');
    expect(c.loginForm.value.correo).toBe('ana@ucundinamarca.edu.co');
    c.olvidar();
    expect(leerRecordado()).toBeNull();
    localStorage.setItem('saesu-recordar', '{');
    expect(leerRecordado()).toBeNull();
    guardarRecordado(null);
  });
});
