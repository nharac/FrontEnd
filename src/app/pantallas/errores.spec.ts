import { afterEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { montar, pintar, limpiar, peticiones, errores } from './montar.testing';
import { Quiz } from '../features/quiz/pages/quiz/quiz';
import { RecuperarPassword } from '../features/usuario/pages/recuperar-password/recuperar-password';
import { VerificarCorreo } from '../features/usuario/pages/verificar-correo/verificar-correo';
import { Perfil } from '../features/usuario/pages/perfil/perfil';
import { DashboardPractica } from '../features/practica/pages/dashboard-practica/dashboard-practica';
import { DashboardEstudiante } from '../features/practica/pages/dashboard-estudiante/dashboard-estudiante';
import { ChatTutor } from '../features/chat/pages/chat-tutor/chat-tutor';
import { VerPublicacion } from '../features/foro/pages/ver-publicacion/ver-publicacion';
import { ListaPublicaciones } from '../features/foro/pages/lista-publicaciones/lista-publicaciones';
import { PublicacionDetallePage } from '../features/docente/pages/publicacion-detalle/publicacion-detalle';
import { EstudiantesDocente } from '../features/docente/pages/estudiantes-docente/estudiantes-docente';
import { EstudianteDetallePage } from '../features/docente/pages/estudiante-detalle/estudiante-detalle';
import { BancoPreguntas } from '../features/docente/pages/banco-preguntas/banco-preguntas';
import { ModeracionDocente } from '../features/docente/pages/moderacion-docente/moderacion-docente';
import { DashboardDocente } from '../features/docente/pages/dashboard-docente/dashboard-docente';
import { EstadisticasDocente } from '../features/docente/pages/estadisticas-docente/estadisticas-docente';
import { Ranking } from '../features/gamificacion/pages/ranking/ranking';

/* eslint-disable @typescript-eslint/no-explicit-any */
const tecla = (key: string, extra: KeyboardEventInit = {}) => new KeyboardEvent('keydown', { key, ...extra });
const pegado = (txt: string) => ({ preventDefault() {}, clipboardData: { getData: () => txt } }) as unknown as ClipboardEvent;
const reiniciar = () => { limpiar(); TestBed.resetTestingModule(); };

describe('Cuando el backend falla, las pantallas avisan sin romperse', () => {
  afterEach(limpiar);

  it.each([
    [DashboardEstudiante, /practica\/progreso/, {}],
    [DashboardPractica, /practica\/progreso/, {}],
    [ListaPublicaciones, /foro\/publicaciones/, {}],
    [VerPublicacion, /foro\/publicaciones\/1$/, { params: { id: '1' } }],
    [Ranking, /ranking/, {}],
    [Perfil, /perfil$/, {}],
    [ChatTutor, /chat\/historial/, {}],
  ] as const)('%o', async (componente, url, ruta) => {
    errores.set(url, 500);
    const f = await montar(componente as any, ruta as any);
    expect(f.componentInstance).toBeTruthy();
  });

  it.each([
    [DashboardDocente, /docente\/notificaciones/, {}],
    [EstadisticasDocente, /docente\/estadisticas/, {}],
    [EstudiantesDocente, /docente\/estudiantes$/, {}],
    [EstudianteDetallePage, /docente\/estudiantes\/2$/, { params: { id: '2' } }],
    [BancoPreguntas, /docente\/preguntas/, {}],
    [ModeracionDocente, /docente\/moderacion/, {}],
    [PublicacionDetallePage, /foro\/publicaciones\/1$/, { params: { id: '1' } }],
  ] as const)('docente: %o', async (componente, url, ruta) => {
    errores.set(url, 404);
    const f = await montar(componente as any, ruta as any, 'DOCENTE');
    expect(f.componentInstance).toBeTruthy();
  });
});

describe('Casos especiales', () => {
  afterEach(limpiar);

  it('quiz: teclas numéricas, flechas, tiempo agotado y reanudar tras recargar', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    const f = await montar(Quiz);
    const c = f.componentInstance as any;
    c.empezar();
    await pintar(f);
    c.teclado(tecla('1'));
    c.teclado(tecla('ArrowLeft'));
    c.teclado(tecla('2', { ctrlKey: true }));
    c.teclado(tecla('z'));
    expect(c.respondida(1)).toBe(true);
    // Recargar la página (sessionStorage se conserva): el quiz sigue donde iba
    TestBed.resetTestingModule();
    const f2 = await montar(Quiz);
    const c2 = f2.componentInstance as any;
    expect(c2.etapa()).toBe('en-curso');
    // Se acaba el tiempo y se entrega solo
    vi.setSystemTime(Date.now() + 10 * 60 * 1000);
    vi.advanceTimersByTime(500);
    await pintar(f2);
    expect(peticiones.some(p => p.url.endsWith('/finalizar'))).toBe(true);
  });

  it('quiz: errores al empezar, entregar y abrir un quiz anterior', async () => {
    const f = await montar(Quiz);
    const c = f.componentInstance as any;
    errores.set(/quiz\/iniciar/, 500);
    c.empezar();
    await pintar(f);
    c.empezar();
    await pintar(f);
    errores.set(/finalizar/, 409);
    c.entregar();
    await pintar(f);
    c.empezar();
    await pintar(f);
    errores.set(/finalizar/, 500);
    c.entregar();
    await pintar(f);
    errores.set(/quiz\/8$/, 500);
    c.verAnterior(8);
    await pintar(f);
    expect(c.etapa()).toBeTypeOf('string');
  });

  it('recuperar contraseña: errores del servidor en cada paso', async () => {
    const f = await montar(RecuperarPassword, { query: { correo: 'ana@ucundinamarca.edu.co' } });
    const c = f.componentInstance as any;
    c.correo.set('no-es-correo');
    c.pedirCodigo();
    c.correo.set('ana@ucundinamarca.edu.co');
    errores.set(/auth\/recuperar$/, 429);
    c.pedirCodigo();
    await pintar(f);
    c.pedirCodigo();
    await pintar(f);
    c.validarCodigo();
    c.pegar(pegado('12ab'));
    c.pegar(pegado('123456'));
    c.validarCodigo();
    await pintar(f);
    c.password.set('Nueva123!');
    c.confirmar.set('Otra123!');
    c.cambiarPassword();
    c.confirmar.set('Nueva123!');
    errores.set(/restablecer/, 400);
    c.cambiarPassword();
    await pintar(f);
    c.escribirDigito(5, { target: { value: '9' } } as any);
    c.teclaDigito(3, tecla('ArrowLeft'));
    c.teclaDigito(3, tecla('Backspace'));
    expect(c.error()).toBeTypeOf('string');
  });

  it('verificar correo: errores al reenviar y código vencido', async () => {
    const f = await montar(VerificarCorreo, { query: { correo: 'ana@ucundinamarca.edu.co' } });
    const c = f.componentInstance as any;
    c.verificar();
    errores.set(/reenviar-verificacion/, 429);
    c.reenviar();
    await pintar(f);
    c.reenviar();
    errores.set(/verificar-correo/, 410);
    c.pegar(pegado('654321'));
    c.verificar();
    await pintar(f);
    c.escribirDigito(2, { target: { value: 'x' } } as any);
    c.escribirDigito(2, { target: { value: '7' } } as any);
    c.teclaDigito(2, tecla('ArrowRight'));
    expect(c.error()).toBeTypeOf('string');
  });

  it('perfil: errores al guardar', async () => {
    const f = await montar(Perfil);
    const c = f.componentInstance as any;
    c.guardarNombre();
    c.cambiarPassword();
    c.formNombre.setValue({ nombre: 'Ana María' });
    errores.set(/perfil$/, 500);
    c.guardarNombre();
    c.formPassword.setValue({ passwordActual: 'Vieja123!', passwordNueva: 'Nueva123!', confirmar: 'Nueva123!' });
    errores.set(/password/, 400);
    c.cambiarPassword();
    errores.set(/perfil\/foto/, 500);
    c.elegirFoto({ target: { files: [new File(['x'], 'yo.png', { type: 'image/png' })], value: '' } } as any);
    c.elegirFoto({ target: { files: [], value: '' } } as any);
    await pintar(f);
    expect(c.guardandoNombre()).toBe(false);
  });

  it('chat: error al enviar y límite diario', async () => {
    const f = await montar(ChatTutor);
    const panel = f.debugElement.query(d => d.name === 'app-chat-panel')?.componentInstance as any;
    panel.enviar();
    panel.texto.set('Hola');
    errores.set(/chat\/mensaje/, 429);
    panel.enviar();
    await pintar(f);
    panel.texto.set('Otra vez');
    errores.set(/chat\/mensaje/, 503);
    panel.enviar();
    await pintar(f);
    panel.alPresionarTecla(tecla('Enter', { shiftKey: true }));
    errores.set(/chat\/historial/, 500);
    panel.limpiarHistorial();
    await pintar(f);
    expect(panel.enviando()).toBe(false);
  });

  it('práctica: respuesta correcta y errores de la tarjeta', async () => {
    const f = await montar(DashboardPractica);
    const c = f.componentInstance as any;
    c.elegirTema('integrales');
    c.empezar();
    await pintar(f);
    const card = f.debugElement.query(d => d.name === 'app-pregunta-card').componentInstance as any;
    card.responder();
    card.alPresionarTecla(tecla('1'));
    card.alPresionarTecla(tecla('ArrowDown'));
    errores.set(/responder/, 500);
    card.elegir({ id: 1, letra: 'A', texto: '2x' });
    card.responder();
    await pintar(f);
    errores.set(/pista/, 500);
    card.pedirPista();
    await pintar(f);
    errores.set(/practica\/preguntas/, 500);
    c.empezar();
    await pintar(f);
    expect(card).toBeTruthy();
  });

  it('docente: errores al moderar, exportar y responder', async () => {
    const f = await montar(PublicacionDetallePage, { params: { id: '1' } }, 'DOCENTE');
    const c = f.componentInstance as any;
    for (const [re, accion] of [[/oficial/, () => c.quitarOficial(10)], [/ocultar/, () => c.ocultarRespuesta(12)],
                                 [/respuestas$/, () => c.responder('Hola')], [/ocultar/, () => c.ocultarPublicacion()]] as const) {
      errores.set(re, 500);
      accion();
      await pintar(f);
    }
    c.responder('   ');
    reiniciar();
    const e = await montar(EstudiantesDocente, {}, 'DOCENTE');
    errores.set(/exportar/, 500);
    (e.componentInstance as any).exportar();
    await pintar(e);
    reiniciar();
    const m = await montar(ModeracionDocente, {}, 'DOCENTE');
    errores.set(/ocultar/, 500);
    (m.componentInstance as any).restaurar({ tipo: 'RESPUESTA', id: 12 });
    await pintar(m);
    reiniciar();
    const b = await montar(BancoPreguntas, {}, 'DOCENTE');
    errores.set(/estado$/, 500);
    (b.componentInstance as any).alternarActiva({ id: 7, activa: true }, { stopPropagation() {} } as any);
    await pintar(b);
    expect(peticiones.length).toBeGreaterThan(0);
  });
});
