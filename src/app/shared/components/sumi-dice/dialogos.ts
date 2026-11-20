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
  'Acertar al primer intento vale 20 Puntos Sumi. ¡Sin afán, piensa bien!',
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
  'Responder dudas de otros también suma Puntos Sumi (hasta 3 al día).',
  'Puedes adjuntar una foto del ejercicio en tu publicación.',
];

/** Ranking según la posición. */
export function mensajeRanking(posicion: number | null, puntosParaSubir: number | null, siguiente: string | null): {
  estado: 'celebra' | 'feliz' | 'animo'; titulo: string; texto: string;
} {
  if (posicion === 1) return { estado: 'celebra', titulo: '¡Vas de primero!', texto: 'Defiende el puesto: cada día de práctica cuenta.' };
  if (posicion && posicion <= 3) {
    return { estado: 'feliz', titulo: `¡Estás en el podio, #${posicion}!`,
      texto: puntosParaSubir ? `Te faltan ${puntosParaSubir} Puntos Sumi para pasar a ${siguiente ?? 'quien va arriba'}.` : 'Sigue sumando.' };
  }
  if (posicion) {
    return { estado: 'animo', titulo: `Vas en el puesto #${posicion}`,
      texto: puntosParaSubir ? `Con ${puntosParaSubir} Puntos Sumi más pasas a ${siguiente ?? 'quien va arriba'}. Una sesión de práctica puede bastar.` : 'Practica para subir.' };
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

// ============================================
// Ejercicios resueltos
// ============================================

type EstadoSumi = 'feliz' | 'saludo' | 'pensando' | 'celebra' | 'nervioso' | 'animo';
export interface DialogoSumi { estado: EstadoSumi; titulo: string; mensajes: string[]; tono: 'normal' | 'exito' | 'alerta' | 'info' }

const CONSEJO_TEMA: Record<string, string[]> = {
  fundamentos: ['Las bases lo son todo: fracciones y potencias aparecen en cada tema de cálculo.', 'Recuerda: primero paréntesis, luego potencias, luego × ÷ y al final + −.'],
  algebra: ['Despejar es deshacer: lo que suma pasa a restar, lo que multiplica pasa a dividir.', 'Antes de usar la fórmula cuadrática, mira si se puede factorizar: es más rápido.'],
  trigonometria: ['SOH-CAH-TOA: seno = opuesto/hipotenusa, coseno = adyacente/hipotenusa, tangente = opuesto/adyacente.', 'Si te sabes sen 30°, 45° y 60°, ya tienes medio tema ganado.'],
  limites: ['Siempre empieza sustituyendo. Si sale 0/0, factoriza y vuelve a intentar.', 'En límites al infinito, mira solo los términos de mayor grado.'],
  derivadas: ['Regla de la cadena: derivada de afuera por derivada de adentro.', 'La derivada en un punto es la pendiente de la recta tangente.'],
  integrales: ['Integrar es derivar al revés. ¡No olvides el + C!', 'En sustitución, busca una función cuya derivada también aparezca.'],
  algebra_lineal: ['En Gauss-Jordan el truco es ir columna por columna: pivote en 1 y ceros arriba y abajo.', 'Si el determinante da 0, la matriz no tiene inversa. ¡Revísalo primero!'],
};

/** Sumi en la lista de ejercicios resueltos: consejo del tema y cuánto lleva visto. */
export function sumiListaResueltos(tema: string, nombreTema: string, vistos: number, total: number): DialogoSumi {
  const consejos = CONSEJO_TEMA[tema] ?? [];
  if (total > 0 && vistos >= total) {
    return { estado: 'celebra', titulo: `¡Viste todo ${nombreTema}!`, mensajes: ['Ya eres experto en este tema. ¿Pruebas un quiz para medirte?'], tono: 'exito' };
  }
  if (vistos === 0) {
    return { estado: 'saludo', titulo: `¡Vamos con ${nombreTema}!`, mensajes: ['Abre un ejercicio y trata de adivinar cada paso antes de verlo.', ...consejos], tono: 'normal' };
  }
  const faltan = total - vistos;
  return { estado: 'feliz', titulo: `Llevas ${vistos} de ${total}`, mensajes: [`Te faltan ${faltan}. ¡Uno más y sigues sumando!`, ...consejos], tono: 'normal' };
}

/** Sumi dentro de un ejercicio: acompaña cada paso y celebra al final. */
export function sumiPasoResuelto(visibles: number, total: number, nivel: string): DialogoSumi {
  if (visibles === 0) {
    return {
      estado: 'pensando', titulo: nivel === 'Avanzado' ? 'Este es de los difíciles' : 'Antes de empezar…',
      mensajes: ['Lee el enunciado con calma. ¿Qué te piden encontrar?', 'Intenta hacer el primer paso en tu cuaderno y luego compara.'], tono: 'info',
    };
  }
  if (visibles >= total) {
    return { estado: 'celebra', titulo: '¡Lo resolvimos!', mensajes: ['Ahora tápalo e inténtalo tú solo. Así es como se aprende de verdad.', 'Lee la idea para recordar: te sirve para todos los ejercicios parecidos.'], tono: 'exito' };
  }
  if (visibles === total - 1) {
    return { estado: 'feliz', titulo: '¡Último paso!', mensajes: ['¿Ya sabes cuál es la respuesta? Dila antes de verla.'], tono: 'normal' };
  }
  return { estado: 'pensando', titulo: `Paso ${visibles} de ${total}`, mensajes: ['¿Entendiste el porqué? Si no, léelo otra vez antes de seguir.', '¿Cuál crees que es el siguiente paso? Piénsalo un momento.'], tono: 'normal' };
}

// ============================================
// Retos entre compañeros
// ============================================

/** Sumi en la portada de retos. */
export function sumiRetos(pendientes: number, ganados: number, jugados: number, hayCompaneros: boolean): DialogoSumi {
  if (!hayCompaneros) {
    return { estado: 'pensando', titulo: 'Aún no hay rivales', mensajes: ['Cuando tus compañeros se registren podrás retarlos aquí.'], tono: 'info' };
  }
  if (pendientes > 0) {
    return { estado: 'nervioso', titulo: pendientes === 1 ? '¡Tienes un reto esperando!' : `¡Tienes ${pendientes} retos esperando!`, mensajes: ['No los hagas esperar. ¡Demuestra lo que sabes!'], tono: 'alerta' };
  }
  if (jugados === 0) {
    return { estado: 'saludo', titulo: '¡Bienvenido a la arena!', mensajes: ['Elige a un compañero y un tema. Los dos responden las mismas 5 preguntas.', 'Gana quien acierte más; si empatan, gana el más rápido.'], tono: 'normal' };
  }
  const pct = Math.round((ganados / jugados) * 100);
  return {
    estado: pct >= 50 ? 'celebra' : 'animo',
    titulo: pct >= 50 ? `¡Ganas el ${pct} % de tus retos!` : 'Cada reto te hace más fuerte',
    mensajes: pct >= 50 ? ['¿Te atreves con un tema más difícil?', 'Reta a alguien que vaya arriba en el ranking.'] : ['Repasa en Resueltos el tema que más te cuesta y vuelve a retar.', 'Perder también enseña: mira en qué fallaste.'],
    tono: pct >= 50 ? 'exito' : 'normal',
  };
}

/** Sumi mientras se juega un reto. */
export function sumiJugando(contestadas: number, total: number, segundos: number, modo = 'CLASICO', restantes: number | null = null): DialogoSumi {
  if (modo === 'RELAMPAGO' && restantes !== null && restantes <= 10 && contestadas < total) {
    return { estado: 'nervioso', titulo: '¡Se acaba el tiempo!', mensajes: ['Responde lo que puedas, ¡rápido!'], tono: 'alerta' };
  }
  if (contestadas === 0) {
    const inicio: Record<string, string> = {
      MUERTE_SUBITA: 'A muerte: cuenta tu racha hasta el primer error. ¡Ve con cuidado!',
      PUNTOS: 'Las preguntas difíciles valen más. Fíjate en los puntos de cada una.',
      RELAMPAGO: '¡60 segundos! Si dudas, pasa a la siguiente y vuelve después.',
    };
    return { estado: 'animo', titulo: '¡Tú puedes!', mensajes: [inicio[modo] ?? 'Lee bien cada pregunta. La velocidad solo cuenta si empatan.'], tono: 'normal' };
  }
  if (contestadas >= total) return { estado: 'celebra', titulo: '¡Todas respondidas!', mensajes: ['Revisa si quieres y entrega cuando estés listo.'], tono: 'exito' };
  if (modo !== 'RELAMPAGO' && segundos > 120) return { estado: 'nervioso', titulo: 'Sin afán, pero…', mensajes: ['El reloj sigue corriendo. ¡Confía en lo que sabes!'], tono: 'alerta' };
  return { estado: 'feliz', titulo: `Vas ${contestadas} de ${total}`, mensajes: ['¡Buen ritmo! Sigue así.'], tono: 'normal' };
}

/** Sumi al ver el resultado de un reto. */
export function sumiResultadoReto(resultado: string | null, estado: string, rival: string): DialogoSumi {
  if (estado !== 'TERMINADO') return { estado: 'pensando', titulo: '¡Entregado!', mensajes: [`Ahora le toca a ${rival}. Te aviso el resultado cuando juegue.`], tono: 'info' };
  if (resultado === 'GANASTE') return { estado: 'celebra', titulo: '¡GANASTE!', mensajes: [`Le ganaste a ${rival}. ¡Qué nivel!`], tono: 'exito' };
  if (resultado === 'EMPATE') return { estado: 'feliz', titulo: '¡Empate perfecto!', mensajes: ['Mismos aciertos y mismo tiempo. ¡Pidan la revancha!'], tono: 'normal' };
  return { estado: 'animo', titulo: 'Esta vez no fue', mensajes: [`${rival} ganó esta, pero la revancha es tuya. Repasa el tema en Resueltos.`], tono: 'normal' };
}
