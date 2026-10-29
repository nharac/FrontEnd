/**
 * Lo que dice Sumi en cada módulo. Todo en un solo lugar para cambiar los textos fácil.
 * Cuando hay varias frases, el globo muestra una al azar y deja pedir "otro consejo".
 */

/** Consejos cortos de cálculo (inicio y práctica). */
export const CONSEJOS_CALCULO = [
  'Si al reemplazar te da 0/0, no es el final: factoriza, racionaliza o usa L’Hôpital.',
  'En un límite al infinito, divide todo entre la potencia más alta de x.',
  'Regla de la cadena: deriva "lo de afuera" dejando igual lo de adentro, y multiplica por la derivada de lo de adentro.',
  'La derivada de una constante es 0, pero en una integral nunca olvides el + C.',
  'Para integrar por sustitución, busca una función cuya derivada también aparezca en la integral.',
  'Por partes: elige como u lo que se simplifica al derivar (polinomios, logaritmos).',
  'sen(x)/x → 1 cuando x → 0. Ese límite aparece más de lo que crees.',
  'Antes de responder, revisa los signos: es el error más común en derivadas.',
  'Una integral definida es un número: si te da una función, revisa los límites de integración.',
  'Practicar un poquito cada día rinde más que una maratón el día antes del parcial.',
];

/** Inicio del estudiante según su racha. */
export function saludoInicio(racha: number | null, practicoHoy: boolean): { titulo: string; estado: 'celebra' | 'feliz' | 'saludo' } {
  if (racha && racha >= 3) return { titulo: `¡${racha} días seguidos! Así se hace`, estado: 'celebra' };
  if (racha && practicoHoy) return { titulo: 'Hoy ya practicaste, ¡bien!', estado: 'feliz' };
  if (racha) return { titulo: `Llevas ${racha} ${racha === 1 ? 'día' : 'días'} de racha: ¡no la sueltes!`, estado: 'saludo' };
  return { titulo: 'Un consejo para hoy', estado: 'saludo' };
}

/** Práctica: al elegir tema. */
export const PRACTICA_INICIO = [
  'Elige un tema y vamos pregunta por pregunta. Si fallas, te doy una pista.',
  'Acertar al primer intento vale 20 puntos. ¡Sin afán, piensa bien!',
  'Si te atascas, pulsa "Pedir ayuda" y te guío sin darte la respuesta.',
];

/** Práctica: reacción a cada respuesta. */
export function reaccionPractica(correcta: boolean, intentos: number, conPista: boolean): {
  estado: 'celebra' | 'feliz' | 'animo' | 'pensando'; titulo: string; texto: string;
} {
  if (correcta && intentos === 1) {
    return { estado: 'celebra', titulo: '¡A la primera!', texto: 'Eso es dominar el tema. Sigue así.' };
  }
  if (correcta) {
    return { estado: 'feliz', titulo: '¡Lo lograste!', texto: `Te tomó ${intentos} intentos, y no te rendiste. Eso cuenta mucho.` };
  }
  if (conPista) {
    return { estado: 'pensando', titulo: 'Mira la pista con calma', texto: 'Léela y vuelve a intentar. Ya descartaste una opción.' };
  }
  return intentos >= 2
    ? { estado: 'animo', titulo: 'No te rindas', texto: 'Si quieres, pide ayuda y lo resolvemos paso a paso.' }
    : { estado: 'animo', titulo: 'Casi…', texto: 'Revisa el procedimiento y prueba otra opción.' };
}

/** Resultado de una sesión de práctica o de un quiz, según el porcentaje. */
export function reaccionResultado(porcentaje: number): {
  estado: 'celebra' | 'feliz' | 'animo'; tono: 'exito' | 'normal' | 'alerta';
} {
  if (porcentaje >= 80) return { estado: 'celebra', tono: 'exito' };
  if (porcentaje >= 50) return { estado: 'feliz', tono: 'normal' };
  return { estado: 'animo', tono: 'alerta' };
}

/** Foro. */
export const FORO = [
  '¿Te quedaste en un ejercicio? Publícalo: tus compañeros y los docentes te ayudan.',
  'Una buena pregunta incluye lo que intentaste. Así te ayudan más rápido.',
  'Responder dudas de otros también suma puntos (hasta 3 al día).',
  'Puedes adjuntar una foto del ejercicio en tu publicación.',
];

/** Ranking según la posición. */
export function mensajeRanking(posicion: number | null, puntosParaSubir: number | null, siguiente: string | null): {
  estado: 'celebra' | 'feliz' | 'animo'; titulo: string; texto: string;
} {
  if (posicion === 1) return { estado: 'celebra', titulo: '¡Vas de primero!', texto: 'Defiende el puesto: cada día de práctica cuenta.' };
  if (posicion && posicion <= 3) {
    return { estado: 'feliz', titulo: `¡Estás en el podio, #${posicion}!`,
      texto: puntosParaSubir ? `Te faltan ${puntosParaSubir} puntos para pasar a ${siguiente ?? 'quien va arriba'}.` : 'Sigue sumando.' };
  }
  if (posicion) {
    return { estado: 'animo', titulo: `Vas en el puesto #${posicion}`,
      texto: puntosParaSubir ? `Con ${puntosParaSubir} puntos más pasas a ${siguiente ?? 'quien va arriba'}. Una sesión de práctica puede bastar.` : 'Practica para subir.' };
  }
  return { estado: 'animo', titulo: 'Todavía no apareces', texto: 'Responde unas preguntas en la práctica y entras al ranking.' };
}

// ---------------- Docente ----------------

export function saludoDocente(nombre: string, pendientes: number | null): { titulo: string; texto: string; estado: 'saludo' | 'feliz' | 'pensando' } {
  const primer = (nombre || '').trim().split(/\s+/)[0];
  const hola = primer ? `¡Hola, ${primer}!` : '¡Hola, profe!';
  if (pendientes === null) return { titulo: hola, texto: 'Estoy revisando el foro…', estado: 'saludo' };
  if (pendientes === 0) return { titulo: hola, texto: 'No hay consultas pendientes. Todo el foro tiene respuesta oficial.', estado: 'feliz' };
  return { titulo: hola, texto: `Hay ${pendientes} ${pendientes === 1 ? 'consulta' : 'consultas'} sin respuesta oficial esperándote.`, estado: 'pensando' };
}

export function mensajeEstudiantes(enRiesgo: number, nuevos: number): { titulo: string; texto: string; estado: 'feliz' | 'pensando' | 'nervioso'; tono: 'exito' | 'normal' | 'alerta' } {
  const extraNuevos = nuevos ? ` ${nuevos} ${nuevos === 1 ? 'es nuevo y todavía tiene' : 'son nuevos y todavía tienen'} tiempo para empezar.` : '';
  if (!enRiesgo) return { titulo: 'Todo el grupo va al día', texto: 'Nadie está en riesgo por ahora.' + extraNuevos, estado: 'feliz', tono: 'exito' };
  return {
    titulo: `${enRiesgo} ${enRiesgo === 1 ? 'estudiante necesita' : 'estudiantes necesitan'} atención`,
    texto: 'Usa el filtro "En riesgo" y abre cada uno para ver dónde se equivoca.' + extraNuevos,
    estado: enRiesgo > 3 ? 'nervioso' : 'pensando', tono: 'alerta',
  };
}

export function mensajeEstadisticas(temaMasBajo: string | null, porcentaje: number | null): string[] {
  const base = [
    'Las preguntas que más fallan son buenas candidatas para repasar en clase.',
    'Si un tema tiene pocos intentos, quizá falte motivar al grupo a practicarlo.',
  ];
  if (temaMasBajo && porcentaje !== null) {
    return [`El tema con menos aciertos es ${temaMasBajo} (${porcentaje} %). Podría valer la pena repasarlo.`, ...base];
  }
  return base;
}

export const BANCO_PREGUNTAS = [
  'Una buena pista orienta sin regalar la respuesta: nombra el método, no el resultado.',
  'Las opciones incorrectas funcionan mejor si son errores típicos (un signo, olvidar la cadena…).',
  'Si desactivas una pregunta, deja de salir en la práctica pero se conserva su historial.',
  'Mezcla dificultades: unas básicas para arrancar y algunas avanzadas para retar.',
];
