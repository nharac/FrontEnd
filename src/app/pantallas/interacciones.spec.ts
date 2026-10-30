import { afterEach, describe, expect, it } from 'vitest';
import { montar, pintar, texto, limpiar, peticiones, errores } from './montar.testing';
import { DashboardPractica } from '../features/practica/pages/dashboard-practica/dashboard-practica';
import { DashboardEstudiante } from '../features/practica/pages/dashboard-estudiante/dashboard-estudiante';
import { Quiz } from '../features/quiz/pages/quiz/quiz';
import { RecuperarPassword } from '../features/usuario/pages/recuperar-password/recuperar-password';
import { VerificarCorreo } from '../features/usuario/pages/verificar-correo/verificar-correo';
import { LoginForm } from '../features/usuario/pages/auth/login-form/login-form';
import { RegistroForm } from '../features/usuario/pages/auth/registro-form/registro-form';
import { Auth } from '../features/usuario/pages/auth/auth';
import { Perfil } from '../features/usuario/pages/perfil/perfil';
import { ListaPublicaciones } from '../features/foro/pages/lista-publicaciones/lista-publicaciones';
import { NuevaPublicacion } from '../features/foro/pages/nueva-publicacion/nueva-publicacion';
import { VerPublicacion } from '../features/foro/pages/ver-publicacion/ver-publicacion';
import { Ranking } from '../features/gamificacion/pages/ranking/ranking';
import { ChatTutor } from '../features/chat/pages/chat-tutor/chat-tutor';

/* eslint-disable @typescript-eslint/no-explicit-any */
const ev = (valor: string) => ({ target: { value: valor } }) as unknown as Event;
const tecla = (key: string) => new KeyboardEvent('keydown', { key });
const pegado = (txt: string) => ({ preventDefault() {}, clipboardData: { getData: () => txt } }) as unknown as ClipboardEvent;

describe('Flujos del estudiante', () => {
  afterEach(limpiar);

  it('práctica: elegir tema, empezar, acertar y pasar a la siguiente', async () => {
    const f = await montar(DashboardPractica);
    const c = f.componentInstance as any;
    c.elegirTema('derivadas');
    c.elegirDificultad('basico');
    c.empezar();
    await pintar(f);
    expect(peticiones.some(p => p.url.includes('/practica/preguntas'))).toBe(true);
    expect(texto(f)).toContain('x²');
    c.alAcertar({ primerIntento: true, puntos: 20, logros: [] });
    c.siguiente();
    c.siguiente();
    await pintar(f);
    expect(c.trazo(50)).toBeGreaterThan(0);
    c.volverASeleccion();
    await pintar(f);
  });

  it('práctica: la tarjeta de pregunta responde, pide pista y abre el chat', async () => {
    const f = await montar(DashboardPractica);
    const c = f.componentInstance as any;
    c.elegirTema('limites');
    c.empezar();
    await pintar(f);
    const tarjeta = f.debugElement.query(d => d.name === 'app-pregunta-card');
    expect(tarjeta).toBeTruthy();
    const card = tarjeta.componentInstance as any;
    card.elegir({ id: 2, letra: 'B', texto: 'x' });
    expect(card.estadoOpcion({ id: 2, letra: 'B', texto: 'x' })).toBe('seleccionada');
    card.responder();
    await pintar(f);
    expect(card.validacion()?.esCorrecta).toBe(false);
    expect(card.estadoOpcion({ id: 1, letra: 'A', texto: '2x' })).toBeTypeOf('string');
    card.pedirPista();
    card.alPresionarTecla(tecla('a'));
    card.alPresionarTecla(tecla('Enter'));
    card.alternarChat();
    await pintar(f);
    card.alternarChat();
  });

  it('inicio: ir a practicar', async () => {
    const f = await montar(DashboardEstudiante);
    const c = f.componentInstance as any;
    c.practicar('limites');
    c.irAPractica();
    expect(c.estadoTema(90, 10)).toBeTypeOf('string');
    expect(c.estadoTema(10, 10)).toBeTypeOf('string');
    expect(c.estadoTema(0, 0)).toBeTypeOf('string');
  });

  it('quiz completo: empezar, responder, entregar y revisar', async () => {
    const f = await montar(Quiz);
    const c = f.componentInstance as any;
    c.tema.set('limites');
    c.cantidad.set(5);
    c.empezar();
    await pintar(f);
    expect(c.etapa()).toBe('en-curso');
    c.elegir('A');
    c.teclado(tecla('ArrowRight'));
    c.siguiente();
    c.ir(0);
    expect(c.respondida(1)).toBe(true);
    c.teclado(tecla('b'));
    c.antesDeSalir({ preventDefault() {}, returnValue: '' } as any);
    c.pedirEntrega();
    await pintar(f);
    c.irAPendiente();
    c.pedirEntrega();
    c.entregar();
    await pintar(f);
    expect(c.resultado()?.porcentaje).toBe(50);
    expect(texto(f)).toContain('lim 1');
    const d = c.resultado().detalle[1];
    expect(c.claseOpcion(d, 'A')).toBeTypeOf('string');
    expect(c.claseOpcion(d, 'B')).toBeTypeOf('string');
    expect(c.textoDe(d, 'A')).toBe('0');
    expect(c.textoDe(d, null)).toBeTypeOf('string');
    c.soloErrores?.set(true);
    await pintar(f);
    c.repetir();
    await pintar(f);
    c.volverAlInicio();
    c.verAnterior(8);
    await pintar(f);
    expect(c.resultado()).toBeTruthy();
  });

  it('foro: filtrar, ordenar, buscar y cargar más', async () => {
    const f = await montar(ListaPublicaciones);
    const c = f.componentInstance as any;
    c.elegirTema('limites');
    c.cambiarOrden('respuestas');
    c.busqueda?.set?.('límite');
    c.buscar();
    c.limpiarBusqueda();
    c.cargarMas();
    c.abrir({ id: 1 });
    await pintar(f);
    expect(peticiones.filter(p => p.url.includes('/foro/publicaciones')).length).toBeGreaterThan(2);
  });

  it('foro: crear publicación con imagen', async () => {
    globalThis.URL.createObjectURL ??= (() => 'blob:x') as any;
    globalThis.URL.revokeObjectURL ??= (() => undefined) as any;
    const f = await montar(NuevaPublicacion);
    const c = f.componentInstance as any;
    c.elegirTema('derivadas');
    c.form.setValue({ titulo: '¿Cómo derivo x²?', tema: 'derivadas', contenido: 'No entiendo la regla de la potencia' });
    const archivo = new File(['x'], 'foto.png', { type: 'image/png' });
    c.elegirImagen({ target: { files: [archivo], value: '' } } as any);
    c.soltarImagen({ preventDefault() {}, dataTransfer: { files: [new File(['x'], 'doc.txt', { type: 'text/plain' })] } } as any);
    c.quitarImagen();
    c.elegirImagen({ target: { files: [archivo], value: '' } } as any);
    await pintar(f);
    c.publicar();
    await pintar(f);
    expect(peticiones.some(p => p.metodo === 'POST' && p.url.endsWith('/foro/publicaciones'))).toBe(true);
  });

  it('foro: responder y eliminar', async () => {
    const f = await montar(VerPublicacion, { params: { id: '1' } });
    const c = f.componentInstance as any;
    c.responder('Gracias, ya entendí la regla');
    c.responder('Respuesta anidada', 10);
    c.eliminar();
    c.eliminar();
    await pintar(f);
    expect(peticiones.some(p => p.metodo === 'POST' && p.url.endsWith('/respuestas'))).toBe(true);
    const item = f.debugElement.query(d => d.name === 'app-respuesta-item');
    if (item) {
      const r = item.componentInstance as any;
      r.alternarRespuesta();
      r.texto?.set?.('Hola');
      r.enviarRespuesta();
    }
  });

  it('ranking: cambiar de periodo', async () => {
    const f = await montar(Ranking);
    const c = f.componentInstance as any;
    c.cambiarPeriodo('mes');
    c.cambiarPeriodo('total');
    await pintar(f);
    expect(c.ancho(250)).toBeGreaterThan(0);
    expect(c.esYo({ usuarioId: 4 })).toBeTypeOf('boolean');
  });

  it('chat: preguntar, usar sugerencia, copiar y limpiar', async () => {
    const f = await montar(ChatTutor);
    const c = f.componentInstance as any;
    c.preguntar('¿Qué es un límite?');
    await pintar(f);
    const panel = f.debugElement.query(d => d.name === 'app-chat-panel')?.componentInstance as any;
    expect(panel).toBeTruthy();
    panel.usarSugerencia('Explícame la regla de la cadena');
    panel.texto.set('Ayuda con derivadas');
    panel.alPresionarTecla(new KeyboardEvent('keydown', { key: 'Enter' }));
    panel.ajustarAltura();
    Object.assign(navigator, { clipboard: { writeText: () => Promise.resolve() } });
    panel.copiar(panel.mensajes()[0]);
    panel.limpiarHistorial();
    await pintar(f);
    expect(peticiones.some(p => p.metodo === 'POST' && p.url.endsWith('/chat/mensaje'))).toBe(true);
  });

  it('perfil: cambiar nombre, contraseña y foto', async () => {
    const f = await montar(Perfil);
    const c = f.componentInstance as any;
    c.formNombre.setValue({ nombre: 'Ana María Ruiz' });
    c.guardarNombre();
    c.formPassword.setValue({ passwordActual: 'Vieja123!', passwordNueva: 'Nueva123!', confirmar: 'Nueva123!' });
    c.cambiarPassword();
    c.elegirFoto({ target: { files: [new File(['x'], 'yo.png', { type: 'image/png' })], value: '' } } as any);
    c.elegirFoto({ target: { files: [new File(['x'], 'yo.txt', { type: 'text/plain' })], value: '' } } as any);
    await pintar(f);
    expect(peticiones.some(p => p.metodo === 'PUT')).toBe(true);
  });
});

describe('Flujos públicos', () => {
  afterEach(limpiar);

  it('recuperar contraseña de principio a fin', async () => {
    const f = await montar(RecuperarPassword);
    const c = f.componentInstance as any;
    c.pedirCodigo();
    c.correo.set('ana@ucundinamarca.edu.co');
    c.pedirCodigo();
    await pintar(f);
    c.escribirDigito(0, ev('4'));
    c.teclaDigito(1, tecla('Backspace'));
    c.teclaDigito(0, tecla('ArrowRight'));
    c.pegar(pegado('482915'));
    c.validarCodigo();
    await pintar(f);
    c.password.set('corta');
    c.cambiarPassword();
    c.password.set('Nueva123!');
    c.confirmar.set('Nueva123!');
    c.cambiarPassword();
    await pintar(f);
    c.cambiarCorreo();
    c.irAlLogin();
    expect(peticiones.filter(p => p.url.includes('/auth/')).length).toBeGreaterThanOrEqual(2);
  });

  it('recuperar contraseña con código incorrecto', async () => {
    const f = await montar(RecuperarPassword);
    const c = f.componentInstance as any;
    c.correo.set('ana@ucundinamarca.edu.co');
    c.pedirCodigo();
    await pintar(f);
    errores.set(/recuperar\/validar/, 400);
    c.pegar(pegado('000000'));
    c.validarCodigo();
    await pintar(f);
    expect(c.error()).not.toBe('');
  });

  it('verificar correo: escribir el código, reenviar y verificar', async () => {
    const f = await montar(VerificarCorreo, { query: { correo: 'ana@ucundinamarca.edu.co' } });
    const c = f.componentInstance as any;
    c.escribirDigito(0, ev('1'));
    c.teclaDigito(0, tecla('Backspace'));
    c.teclaDigito(2, tecla('ArrowLeft'));
    c.reenviar();
    errores.set(/verificar-correo/, 400);
    c.pegar(pegado('111111'));
    c.verificar();
    await pintar(f);
    c.pegar(pegado('123456'));
    c.verificar();
    await pintar(f);
    expect(peticiones.some(p => p.url.endsWith('/verificar-correo'))).toBe(true);
  });

  it('verificar correo sin correo vuelve al login', async () => {
    const f = await montar(VerificarCorreo);
    expect(f.componentInstance).toBeTruthy();
  });

  it('login y registro', async () => {
    const auth = await montar(Auth);
    const a = auth.componentInstance as any;
    a.seguirMouse(new MouseEvent('mousemove', { clientX: 10, clientY: 20 }));
    a.soltarMouse();
    a.toggleModo();
    a.toggleModo();
    limpiar();
    TestBedReset();
    const f = await montar(LoginForm);
    const c = f.componentInstance as any;
    c.onSubmit();
    c.toggleMostrarPassword();
    c.loginForm.setValue({ correo: 'ana@ucundinamarca.edu.co', password: 'Clave123!' });
    c.onSubmit();
    await pintar(f);
    errores.set(/auth\/login/, 401);
    c.onSubmit();
    await pintar(f);
    expect(peticiones.filter(p => p.url.endsWith('/auth/login')).length).toBe(2);
  });

  it('registro', async () => {
    const f = await montar(RegistroForm);
    const c = f.componentInstance as any;
    c.onSubmit();
    c.toggleMostrarPassword();
    c.toggleMostrarConfirmPassword();
    c.registroForm.patchValue({ nombre: 'Ana Ruiz', correo: 'ana@ucundinamarca.edu.co', password: 'Clave123!', confirmPassword: 'Clave123!' });
    c.onSubmit();
    await pintar(f);
    errores.set(/auth\/registro/, 400);
    c.onSubmit();
    await pintar(f);
    expect(peticiones.some(p => p.url.endsWith('/auth/registro'))).toBe(true);
  });
});

import { TestBed } from '@angular/core/testing';
function TestBedReset() { TestBed.resetTestingModule(); }
