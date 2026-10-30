import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

/**
 * Backend falso para las pruebas de pantallas: responde cada URL con datos de ejemplo,
 * sin red. Guarda las peticiones para poder verificarlas.
 */
const HOY = '2026-10-30T09:00:00';
const AYER = '2026-10-29T18:30:00';

export const autor = (id = 4, nombre = 'Ana Ruiz', rol = 'ESTUDIANTE') => ({ id, nombre, iniciales: 'AR', rol });

export const usuario = { id: 4, nombre: 'Ana Ruiz', correo: 'ana@ucundinamarca.edu.co', rol: 'ESTUDIANTE', fechaRegistro: AYER,
  fotoPerfilUrl: null, rachaActual: 3, puntosTotales: 340 };

export const pregunta = (id = 7) => ({ id, tema: 'derivadas', enunciado: 'Deriva f(x) = x²', dificultad: 'basico',
  opciones: [{ id: 1, letra: 'A', texto: '2x' }, { id: 2, letra: 'B', texto: 'x' }, { id: 3, letra: 'C', texto: '2' }, { id: 4, letra: 'D', texto: 'x²' }] });

const respuesta = (id: number, hijas: unknown[] = [], oficial = false) => ({ id, autor: autor(5, 'Leo Mora'), contenido: 'Usa la regla de la potencia',
  esOficial: oficial, fechaCreacion: AYER, respuestasHijas: hijas, oculta: false });

export const publicacionDetalle = { id: 1, titulo: '¿Cómo derivo x²?', contenido: 'No entiendo la regla', tema: 'derivadas',
  autor: autor(), fechaCreacion: AYER, imagenUrl: null, respuestas: [respuesta(10, [respuesta(11)], true), respuesta(12)] };

export const publicacionResumen = (id = 1) => ({ id, titulo: 'Límite lateral ' + id, contenidoPreview: '¿Cómo se calcula?', tema: 'limites',
  autor: autor(), fechaCreacion: AYER, respuestasCount: id % 3, imagenUrl: null });

const temaProgreso = (tema: string, intentos: number) => ({ tema, intentos, correctas: Math.floor(intentos / 2),
  porcentaje: intentos ? 50 : 0, resueltas: 2, totalPreguntas: 15 });

export const estudianteResumen = (id: number, estado: 'nuevo' | 'al-dia' | 'en-riesgo') => ({ id, nombre: 'Estudiante ' + id,
  correo: `e${id}@ucundinamarca.edu.co`, fotoPerfilUrl: null, puntos: 100 * id, racha: id, intentos: 10 * id, correctas: 6 * id,
  porcentaje: 60, ultimaActividad: estado === 'nuevo' ? null : AYER, enRiesgo: estado === 'en-riesgo',
  motivosRiesgo: estado === 'en-riesgo' ? ['No practica hace 9 días'] : [], porTema: [temaProgreso('limites', 4), temaProgreso('derivadas', 0)],
  estado, diasDeGracia: estado === 'nuevo' ? 3 : null, quices: id, promedioQuiz: id > 1 ? 75 : null });

const actividad = [0, 1, 2, 3, 4, 5, 6].map(i => ({ fecha: `2026-10-${23 + i}`, intentos: i * 3, estudiantes: i }));

export const estadisticas = { totalEstudiantes: 3, activosSemana: 2, intentosSemana: 40, porcentajeAciertoGeneral: 62.5,
  estudiantesEnRiesgo: 1, preguntasActivas: 45,
  porTema: [{ tema: 'limites', intentos: 20, correctas: 15, porcentaje: 75, estudiantes: 2, preguntasActivas: 15 },
            { tema: 'derivadas', intentos: 10, correctas: 3, porcentaje: 30, estudiantes: 1, preguntasActivas: 15 },
            { tema: 'integrales', intentos: 0, correctas: 0, porcentaje: 0, estudiantes: 0, preguntasActivas: 15 }],
  preguntasDificiles: [{ id: 7, enunciado: 'Deriva sen(x²)', tema: 'derivadas', dificultad: 'avanzado', intentos: 8, fallos: 6,
    porcentajeFallo: 75, errorFrecuente: 'cos(x²)' }],
  actividad };

export const preguntaDocente = (id: number, activa = true) => ({ id, tema: id % 2 ? 'limites' : 'integrales', enunciado: 'Pregunta ' + id,
  dificultad: 'intermedio', pista: 'Factoriza', activa, intentos: id * 2, porcentajeAcierto: 50, fechaActualizacion: AYER,
  opciones: ['A', 'B', 'C', 'D'].map((letra, i) => ({ id: id * 10 + i, letra, texto: 'Opción ' + letra, esCorrecta: i === 0 })) });

const quizIniciado = { intentoId: 9, tema: 'limites', cantidad: 2, segundosLimite: 180, limiteEn: '2099-01-01T00:00:00Z',
  preguntas: [1, 2].map(orden => ({ orden, preguntaId: orden, tema: 'limites', dificultad: 'basico', enunciado: 'lim ' + orden,
    opciones: [{ letra: 'A', texto: '0' }, { letra: 'B', texto: '1' }] })) };

export const resultadoQuiz = { intentoId: 9, tema: 'limites', correctas: 1, total: 2, porcentaje: 50, duracionSegundos: 75,
  fueraDeTiempo: false, finalizadoEn: HOY, mejorMarca: true,
  detalle: [1, 2].map(orden => ({ orden, preguntaId: orden, tema: 'limites', enunciado: 'lim ' + orden,
    opciones: [{ letra: 'A', texto: '0' }, { letra: 'B', texto: '1' }], letraElegida: orden === 1 ? 'A' : null,
    letraCorrecta: 'A', correcta: orden === 1, pista: 'Sustituye' })) };

const historialQuiz = { intentos: 2, promedio: 70, mejor: 90, ultimos: [
  { id: 8, tema: null, correctas: 9, total: 10, porcentaje: 90, duracionSegundos: 300, fueraDeTiempo: false, fecha: AYER },
  { id: 7, tema: 'derivadas', correctas: 5, total: 10, porcentaje: 50, duracionSegundos: 900, fueraDeTiempo: true, fecha: AYER }] };

const logros = [
  { codigo: 'PRIMER_ACIERTO', nombre: 'Primer acierto', descripcion: 'Acierta una pregunta', icono: 'task_alt', obtenido: true, fechaObtenido: AYER },
  { codigo: 'RACHA_7', nombre: 'Racha de 7', descripcion: '7 días seguidos', icono: 'local_fire_department', obtenido: false, fechaObtenido: null }];

const ranking = [1, 2, 3, 4].map(i => ({ usuarioId: i + 3, nombre: 'Estudiante ' + i, fotoPerfilUrl: null, puntosTotales: 500 - i * 50, rachaActual: i }));

const miPosicion = { periodo: 'semana', posicion: 2, puntos: 400, participantes: 12, puntosParaSubir: 51, siguienteNombre: 'Estudiante 1',
  rachaActual: 3, puntosHoy: 20, puntosSemana: 140, puntosTotales: 640,
  ultimosMovimientos: [{ cantidad: 20, motivo: 'Acierto en práctica: limites', fecha: AYER }, { cantidad: 10, motivo: 'Respondió en el foro', fecha: AYER }] };

const progreso = { limites: { respondidas: 10, correctas: 8, porcentaje: 80 }, derivadas: { respondidas: 4, correctas: 1, porcentaje: 25 },
  integrales: { respondidas: 0, correctas: 0, porcentaje: 0 } };

const chatMensaje = (id: number, rolEmisor: 'usuario' | 'ia', mensaje: string) => ({ id, rolEmisor, mensaje, preguntaId: null, fechaHora: AYER });

const detalleEstudiante = { resumen: estudianteResumen(2, 'en-riesgo'), fechaRegistro: AYER, logrosObtenidos: 3, publicaciones: 1,
  respuestasForo: 4, respuestasOficiales: 1,
  ultimosIntentos: [{ preguntaId: 7, enunciado: 'Deriva', tema: 'derivadas', opcionElegida: 'A) 2x', correcta: true, fecha: AYER }],
  preguntasConMasFallos: [{ preguntaId: 8, enunciado: 'Integra', tema: 'integrales', fallos: 3, resuelta: false }],
  actividad, quices: [{ id: 9, tema: 'limites', correctas: 4, total: 5, porcentaje: 80, duracionSegundos: 200, fueraDeTiempo: false, fecha: AYER }] };

const oculto = [{ tipo: 'PUBLICACION', id: 1, publicacionId: 1, tituloPublicacion: 'Spam', contenido: '...', autor: 'Pedro',
  fechaCreacion: AYER, ocultadoPor: 'Profe', fechaOculta: HOY },
  { tipo: 'RESPUESTA', id: 12, publicacionId: 1, tituloPublicacion: 'Spam', contenido: 'x', autor: 'Ana', fechaCreacion: AYER,
    ocultadoPor: null, fechaOculta: null }];

/** Respuesta de ejemplo para cada ruta de la API (la primera regla que coincida). */
const RUTAS: [string, RegExp, () => unknown][] = [
  ['GET', /\/auth\/perfil$/, () => usuario],
  ['GET', /\/perfil$/, () => usuario],
  ['PUT', /\/perfil$/, () => usuario],
  ['POST', /\/perfil\/foto$/, () => ({ mensaje: 'Foto actualizada', url: 'https://img/foto.png' })],
  ['POST', /\/auth\/login$/, () => ({ usuario, token: 'token-falso' })],
  ['POST', /\/auth\/registro$/, () => ({ correo: usuario.correo, mensaje: 'Revisa tu correo', minutosVigencia: 15 })],
  ['POST', /\/auth\/verificar-correo$/, () => ({ usuario, token: 'token-falso' })],
  ['POST', /\/auth\/(reenviar-verificacion|recuperar|recuperar\/validar|restablecer)$/, () => ({ mensaje: 'Listo' })],
  ['GET', /\/practica\/preguntas\/\d+\/pista$/, () => ({ preguntaId: 7, pista: 'Usa la regla de la potencia', mensaje: null })],
  ['POST', /\/practica\/preguntas\/\d+\/responder$/, () => ({ esCorrecta: false, opcionCorrectaId: 1, pista: 'Baja el exponente',
    mensaje: 'Casi', habilitarSiguiente: false, chatIaHabilitado: true, puntosGanados: 0, puntosEnJuego: 15, nuevosLogros: [] })],
  ['GET', /\/practica\/preguntas/, () => [pregunta(7), pregunta(8)]],
  ['GET', /\/practica\/progreso$/, () => progreso],
  ['GET', /\/chat\/historial/, () => ({ preguntaId: null, mensajes: [chatMensaje(1, 'usuario', 'Hola'), chatMensaje(2, 'ia', '**Claro**, ¿qué intentaste?\n- paso 1\n- paso 2')] })],
  ['POST', /\/chat\/mensaje$/, () => ({ mensajeUsuario: chatMensaje(3, 'usuario', 'Ayuda'), respuestaIa: chatMensaje(4, 'ia', '¿Qué pasa si factorizas?'), mensajesRestantesHoy: 19 })],
  ['DELETE', /\/chat\/historial/, () => null],
  ['GET', /\/foro\/publicaciones\/\d+$/, () => publicacionDetalle],
  ['GET', /\/foro\/publicaciones/, () => [publicacionResumen(1), publicacionResumen(2), publicacionResumen(3)]],
  ['POST', /\/foro\/publicaciones\/\d+\/respuestas$/, () => respuesta(20)],
  ['POST', /\/foro\/publicaciones$/, () => publicacionDetalle],
  ['POST', /\/foro\/imagenes$/, () => ({ url: 'https://img/1.png' })],
  ['DELETE', /\/foro\/publicaciones\/\d+$/, () => null],
  ['GET', /\/ranking\/yo/, () => miPosicion],
  ['GET', /\/ranking/, () => ranking],
  ['GET', /\/logros/, () => logros],
  ['POST', /\/quiz\/iniciar$/, () => quizIniciado],
  ['POST', /\/quiz\/\d+\/finalizar$/, () => resultadoQuiz],
  ['GET', /\/quiz\/historial$/, () => historialQuiz],
  ['GET', /\/quiz\/\d+$/, () => resultadoQuiz],
  ['GET', /\/docente\/notificaciones$/, () => [publicacionResumen(1), publicacionResumen(2)]],
  ['GET', /\/docente\/estadisticas$/, () => estadisticas],
  ['GET', /\/docente\/estudiantes\/\d+\/quices\/\d+$/, () => resultadoQuiz],
  ['GET', /\/docente\/estudiantes\/exportar$/, () => new Blob(['x'])],
  ['GET', /\/docente\/estudiantes\/\d+$/, () => detalleEstudiante],
  ['GET', /\/docente\/estudiantes$/, () => [estudianteResumen(1, 'nuevo'), estudianteResumen(2, 'en-riesgo'), estudianteResumen(3, 'al-dia')]],
  ['GET', /\/docente\/preguntas\/\d+$/, () => preguntaDocente(7)],
  ['GET', /\/docente\/preguntas/, () => [preguntaDocente(7), preguntaDocente(8, false), preguntaDocente(9)]],
  ['POST', /\/docente\/preguntas$/, () => preguntaDocente(10)],
  ['PUT', /\/docente\/preguntas\/\d+$/, () => preguntaDocente(7)],
  ['PATCH', /\/docente\/preguntas\/\d+\/estado$/, () => preguntaDocente(7, false)],
  ['GET', /\/docente\/moderacion$/, () => oculto],
  ['GET', /\/foro\//, () => []],
];

export interface PeticionHecha { metodo: string; url: string; cuerpo: unknown }
export const peticiones: PeticionHecha[] = [];
/** URL (regex) → status de error a devolver en la siguiente llamada que coincida. */
export const errores = new Map<RegExp, number>();

export const apiFalsa: HttpInterceptorFn = (req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
  peticiones.push({ metodo: req.method, url: req.url, cuerpo: req.body });
  for (const [re, status] of errores) {
    if (re.test(req.url)) {
      errores.delete(re);
      return new Observable(s => s.error({ status, message: 'Error de prueba', error: { mensaje: 'Error de prueba' } }));
    }
  }
  const regla = RUTAS.find(([m, re]) => m === req.method && re.test(req.url));
  return of(new HttpResponse({ status: 200, body: regla ? regla[2]() : null, url: req.url }));
};
