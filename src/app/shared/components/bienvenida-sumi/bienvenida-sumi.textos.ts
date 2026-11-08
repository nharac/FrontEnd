import { Bienvenida } from '../../../core/services/bienvenida.service';
import { azar } from '../../utils/azar';

/** Elige un elemento de la lista (al azar por defecto; en las pruebas se pasa uno fijo). */
export type Elegir = <T>(opciones: readonly T[]) => T;
export const alAzar: Elegir = (opciones) => opciones[Math.floor(azar() * opciones.length)];

/** El título se arma en partes para resaltar el nombre: "¡Buenos días, " + "Laura" + "!" + "☀️". */
export interface Titulo { antes: string; nombre: string; despues: string; emoji: string }

type Momento = 'manana' | 'tarde' | 'noche';

export function momentoDelDia(hora: number): Momento {
  if (hora >= 5 && hora < 12) return 'manana';
  if (hora >= 12 && hora < 19) return 'tarde';
  return 'noche';
}

const SALUDO: Record<Momento, { texto: string; emoji: string }> = {
  manana: { texto: '¡Buenos días', emoji: '☀️' },
  tarde: { texto: '¡Buenas tardes', emoji: '🌤️' },
  noche: { texto: '¡Buenas noches', emoji: '🌙' },
};

const TITULOS_NUEVO = [
  { texto: '¡Hola', emoji: '🎉' },
  { texto: '¡Por fin llegaste', emoji: '🎉' },
  { texto: '¡Qué alegría tenerte aquí', emoji: '🥳' },
] as const;

const TITULOS_REGRESO = [
  { texto: '¡Volviste', emoji: '🙌' },
  { texto: '¡Hey', emoji: '👋' },
] as const;

export function tituloBienvenida(d: Bienvenida, nombre: string, hora: number, elegir: Elegir = alAzar): Titulo {
  // Al que regresa casi siempre se le saluda según la hora; de vez en cuando, con algo más informal
  const base = d.nuevo
    ? elegir(TITULOS_NUEVO)
    : elegir([SALUDO[momentoDelDia(hora)], SALUDO[momentoDelDia(hora)], ...TITULOS_REGRESO]);
  return nombre
    ? { antes: `${base.texto}, `, nombre, despues: '!', emoji: base.emoji }
    : { antes: `${base.texto}!`, nombre: '', despues: '', emoji: base.emoji };
}

export const MENSAJES = {
  nuevoEstudiante: [
    'Soy Sumi, un frailejón del Sumapaz 🌿 y desde hoy seré tu compañero de cálculo. ¡Límites, derivadas e integrales, allá vamos! 🚀',
    '¡Qué emoción! 🤩 Soy Sumi y voy a acompañarte a dominar el cálculo paso a paso. ¿Te le mides a tu primera pregunta? 💪',
    'Soy Sumi 🌿. Aquí practicas tipo ICFES, el tutor con IA te da pistas y cada acierto te da Puntos Sumi ⭐. ¡Arranquemos!',
  ],
  nuevoDocente: [
    'Soy Sumi 🌿 y te voy a ayudar a ver quién va volando y quién necesita una mano. ¡Tus estudiantes van a brillar! ✨',
    '¡Bienvenido al equipo! 🤝 Soy Sumi: aquí ves el progreso del grupo, armas preguntas y respondes dudas en el foro. 📚',
  ],
  docente: [
    'Tus estudiantes te esperan 📚. ¡Veamos quién necesita una mano hoy! ✨',
    '¡Qué bueno verte! 👀 Puede que haya dudas en el foro esperando tu respuesta oficial. ✅',
    'Listo para otro día enseñando cálculo 🧮. ¡Vamos a ver cómo va el grupo! 📈',
  ],
  rachaLarga: [
    '¡{n} días seguidos! 🔥 Eres imparable. ¿Sumamos uno más hoy? 💪',
    '¡Wow, {n} días de racha! 🔥🔥 Hasta los frailejones del páramo te aplauden. 👏',
  ],
  racha: [
    '¡Llevas {n} {dias} de racha! 🔥 No la dejes apagar: una pregunta basta para mantenerla viva. 💪',
    '¡Tu racha va en {n} {dias}! 🔥 Hoy es perfecto para hacerla crecer. 🌱',
  ],
  noche: [
    '¿Estudiando de noche? 🌙 ¡Eso es dedicación! Unas preguntas rápidas y a descansar. 😴',
  ],
  regreso: [
    '¡Te extrañé! 🌿 ¿Qué tal unas preguntas para calentar el cerebro? 🧠',
    'Cada pregunta cuenta ⭐. ¡Hoy es un gran día para subir en el ranking! 🏆',
    '¡Volviste! 🙌 El cálculo no se aprende solo… ¡pero conmigo es más fácil! 😄',
    '¿Listo para otra ronda? 🎯 Un quiz de 5 preguntas y ya estás calentando motores. 🚀',
  ],
} as const;

export function mensajeBienvenida(d: Bienvenida, hora: number, elegir: Elegir = alAzar): string {
  if (d.nuevo) return elegir(d.esDocente ? MENSAJES.nuevoDocente : MENSAJES.nuevoEstudiante);
  if (d.esDocente) return elegir(MENSAJES.docente);
  const racha = d.racha ?? 0;
  if (racha >= 7) return elegir(MENSAJES.rachaLarga).replace('{n}', String(racha));
  if (racha > 0) {
    return elegir(MENSAJES.racha).replace('{n}', String(racha)).replace('{dias}', racha === 1 ? 'día' : 'días');
  }
  if (momentoDelDia(hora) === 'noche') return elegir(MENSAJES.noche);
  return elegir(MENSAJES.regreso);
}
