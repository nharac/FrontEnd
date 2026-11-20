/**
 * Biblioteca de ejercicios resueltos paso a paso.
 * Cada paso dice QUÉ se hace y POR QUÉ, en lenguaje sencillo.
 * Es contenido fijo y revisado (no lo genera la IA), así siempre es correcto.
 */

export type TemaResuelto = 'fundamentos' | 'algebra' | 'trigonometria' | 'limites' | 'derivadas' | 'integrales';

export interface PasoResuelto {
  /** Lo que se escribe en este paso. */
  paso: string;
  /** Por qué se hace, explicado con palabras simples. */
  porque: string;
}

export interface EjercicioResuelto {
  id: string;
  tema: TemaResuelto;
  nivel: 'Básico' | 'Intermedio' | 'Avanzado';
  titulo: string;
  enunciado: string;
  pasos: PasoResuelto[];
  respuesta: string;
  /** Idea para recordar y usar en ejercicios parecidos. */
  clave: string;
}

export const TEMAS_RESUELTOS: { id: TemaResuelto; nombre: string; icono: string }[] = [
  { id: 'fundamentos', nombre: 'Fundamentos', icono: 'calculate' },
  { id: 'algebra', nombre: 'Álgebra', icono: 'exposure' },
  { id: 'trigonometria', nombre: 'Trigonometría', icono: 'change_history' },
  { id: 'limites', nombre: 'Límites', icono: 'trending_flat' },
  { id: 'derivadas', nombre: 'Derivadas', icono: 'show_chart' },
  { id: 'integrales', nombre: 'Integrales', icono: 'functions' },
];

export const EJERCICIOS_RESUELTOS: EjercicioResuelto[] = [
  // ================= FUNDAMENTOS =================
  {
    id: 'fun-1', tema: 'fundamentos', nivel: 'Básico', titulo: 'Jerarquía de operaciones',
    enunciado: 'Calcula 6 + 2 × (5 − 3)²',
    pasos: [
      { paso: '6 + 2 × (2)²', porque: 'Lo primero siempre son los paréntesis: 5 − 3 = 2.' },
      { paso: '6 + 2 × 4', porque: 'Después van las potencias: 2² = 2 × 2 = 4.' },
      { paso: '6 + 8', porque: 'Luego multiplicaciones y divisiones, antes que sumas: 2 × 4 = 8.' },
      { paso: '14', porque: 'Al final, las sumas y restas.' },
    ],
    respuesta: '14',
    clave: 'Orden: paréntesis → potencias → multiplicar/dividir → sumar/restar.',
  },
  {
    id: 'fun-2', tema: 'fundamentos', nivel: 'Básico', titulo: 'Suma de fracciones',
    enunciado: 'Calcula 2/3 + 1/4',
    pasos: [
      { paso: 'Denominador común: 12', porque: 'Solo se pueden sumar fracciones con el mismo denominador; 12 es el número más pequeño que está en la tabla del 3 y del 4.' },
      { paso: '2/3 = 8/12  y  1/4 = 3/12', porque: 'Multiplicamos arriba y abajo por el mismo número (4 y 3) para no cambiar el valor de cada fracción.' },
      { paso: '8/12 + 3/12 = 11/12', porque: 'Con el mismo denominador, solo se suman los numeradores.' },
    ],
    respuesta: '11/12',
    clave: 'Primero el mismo denominador; después se suman solo los de arriba.',
  },
  {
    id: 'fun-3', tema: 'fundamentos', nivel: 'Intermedio', titulo: 'Propiedades de las potencias',
    enunciado: 'Simplifica (2³ × 2⁵) ÷ 2⁶',
    pasos: [
      { paso: '2³ × 2⁵ = 2⁸', porque: 'Al multiplicar potencias con la misma base, los exponentes se suman: 3 + 5 = 8.' },
      { paso: '2⁸ ÷ 2⁶ = 2²', porque: 'Al dividir potencias con la misma base, los exponentes se restan: 8 − 6 = 2.' },
      { paso: '2² = 4', porque: 'Calculamos la potencia que quedó.' },
    ],
    respuesta: '4',
    clave: 'Misma base: multiplicar suma exponentes y dividir los resta.',
  },
  {
    id: 'fun-4', tema: 'fundamentos', nivel: 'Intermedio', titulo: 'Ecuación de primer grado',
    enunciado: 'Resuelve 5x − 7 = 2x + 8',
    pasos: [
      { paso: '5x − 2x = 8 + 7', porque: 'Juntamos las x a un lado y los números al otro. Lo que pasa al otro lado cambia de signo.' },
      { paso: '3x = 15', porque: 'Hacemos las operaciones de cada lado.' },
      { paso: 'x = 15 ÷ 3 = 5', porque: 'El 3 está multiplicando a la x, así que pasa dividiendo.' },
      { paso: 'Comprobación: 5(5) − 7 = 18 y 2(5) + 8 = 18', porque: 'Reemplazar el resultado en la ecuación original confirma que está bien.' },
    ],
    respuesta: 'x = 5',
    clave: 'Lo que suma pasa restando y lo que multiplica pasa dividiendo. Siempre comprueba.',
  },

  // ================= ÁLGEBRA =================
  {
    id: 'alg-1', tema: 'algebra', nivel: 'Básico', titulo: 'Cuadrado de un binomio',
    enunciado: 'Desarrolla (x + 5)²',
    pasos: [
      { paso: '(x + 5)² = (x + 5)(x + 5)', porque: 'Elevar al cuadrado es multiplicar algo por sí mismo. ¡No es solo x² + 25!' },
      { paso: 'x·x + x·5 + 5·x + 5·5', porque: 'Cada término del primer paréntesis multiplica a cada término del segundo.' },
      { paso: 'x² + 5x + 5x + 25', porque: 'Hacemos cada multiplicación.' },
      { paso: 'x² + 10x + 25', porque: 'Sumamos los términos semejantes (los que tienen x).' },
    ],
    respuesta: 'x² + 10x + 25',
    clave: '(a + b)² = a² + 2ab + b²: el término del medio es el doble del producto.',
  },
  {
    id: 'alg-2', tema: 'algebra', nivel: 'Intermedio', titulo: 'Factorizar un trinomio',
    enunciado: 'Factoriza x² − 7x + 12',
    pasos: [
      { paso: 'Buscamos dos números que multiplicados den 12 y sumados den −7', porque: 'Si (x + a)(x + b) = x² + (a + b)x + ab, entonces a·b es el número final y a + b el del medio.' },
      { paso: '−3 y −4', porque: '(−3)(−4) = 12 y (−3) + (−4) = −7. Son negativos porque el producto es positivo pero la suma es negativa.' },
      { paso: '(x − 3)(x − 4)', porque: 'Escribimos cada número dentro de un paréntesis con la x.' },
      { paso: 'Comprobación: (x − 3)(x − 4) = x² − 4x − 3x + 12 = x² − 7x + 12', porque: 'Multiplicar de vuelta debe dar la expresión original.' },
    ],
    respuesta: '(x − 3)(x − 4)',
    clave: 'Producto = término independiente; suma = coeficiente de x.',
  },
  {
    id: 'alg-3', tema: 'algebra', nivel: 'Intermedio', titulo: 'Ecuación cuadrática con fórmula',
    enunciado: 'Resuelve 2x² + 3x − 2 = 0',
    pasos: [
      { paso: 'a = 2, b = 3, c = −2', porque: 'Identificamos los coeficientes de ax² + bx + c = 0 para usar la fórmula.' },
      { paso: 'Discriminante: b² − 4ac = 9 − 4(2)(−2) = 9 + 16 = 25', porque: 'Es lo que va dentro de la raíz; como es positivo, habrá dos soluciones.' },
      { paso: 'x = (−3 ± √25) / (2·2) = (−3 ± 5) / 4', porque: 'Aplicamos la fórmula x = (−b ± √(b² − 4ac)) / 2a.' },
      { paso: 'x = 2/4 = 1/2   o   x = −8/4 = −2', porque: 'Una solución con el + y otra con el −.' },
    ],
    respuesta: 'x = 1/2  y  x = −2',
    clave: 'Si el discriminante es positivo hay 2 soluciones, si es 0 hay 1 y si es negativo no hay reales.',
  },
  {
    id: 'alg-4', tema: 'algebra', nivel: 'Avanzado', titulo: 'Ecuación exponencial',
    enunciado: 'Resuelve 4ˣ⁺¹ = 8',
    pasos: [
      { paso: '4 = 2²  y  8 = 2³', porque: 'Escribimos todo con la misma base para poder comparar exponentes.' },
      { paso: '(2²)ˣ⁺¹ = 2³  →  2²ˣ⁺² = 2³', porque: 'Potencia de una potencia: se multiplican los exponentes, 2(x + 1) = 2x + 2.' },
      { paso: '2x + 2 = 3', porque: 'Si las bases son iguales, los exponentes también deben ser iguales.' },
      { paso: 'x = 1/2', porque: 'Despejamos: 2x = 1, entonces x = 1/2.' },
    ],
    respuesta: 'x = 1/2',
    clave: 'En ecuaciones exponenciales, busca escribir ambos lados con la misma base.',
  },

  // ================= TRIGONOMETRÍA =================
  {
    id: 'tri-1', tema: 'trigonometria', nivel: 'Básico', titulo: 'Razones en un triángulo rectángulo',
    enunciado: 'En un triángulo rectángulo los catetos miden 6 y 8. Halla la hipotenusa y el seno del ángulo opuesto al cateto 6.',
    pasos: [
      { paso: 'h² = 6² + 8² = 36 + 64 = 100', porque: 'Teorema de Pitágoras: la hipotenusa al cuadrado es la suma de los catetos al cuadrado.' },
      { paso: 'h = √100 = 10', porque: 'Sacamos raíz para obtener la hipotenusa (una longitud siempre es positiva).' },
      { paso: 'sen θ = opuesto / hipotenusa = 6/10', porque: 'El seno es cateto opuesto sobre hipotenusa (SOH).' },
      { paso: 'sen θ = 3/5', porque: 'Simplificamos la fracción dividiendo entre 2.' },
    ],
    respuesta: 'Hipotenusa = 10, sen θ = 3/5',
    clave: 'SOH-CAH-TOA: Seno = Opuesto/Hipotenusa, Coseno = Adyacente/Hipotenusa, Tangente = Opuesto/Adyacente.',
  },
  {
    id: 'tri-2', tema: 'trigonometria', nivel: 'Básico', titulo: 'De grados a radianes',
    enunciado: 'Convierte 150° a radianes',
    pasos: [
      { paso: '180° = π radianes', porque: 'Es la equivalencia base: media vuelta.' },
      { paso: '150° × (π / 180°)', porque: 'Multiplicamos por π/180 para cambiar de grados a radianes; los grados se cancelan.' },
      { paso: '150π / 180 = 5π/6', porque: 'Simplificamos la fracción dividiendo entre 30.' },
    ],
    respuesta: '5π/6',
    clave: 'Grados → radianes: × π/180. Radianes → grados: × 180/π.',
  },
  {
    id: 'tri-3', tema: 'trigonometria', nivel: 'Intermedio', titulo: 'Ángulo de referencia',
    enunciado: 'Calcula cos 225°',
    pasos: [
      { paso: '225° está en el tercer cuadrante', porque: 'Está entre 180° y 270°.' },
      { paso: 'Ángulo de referencia: 225° − 180° = 45°', porque: 'Medimos cuánto se pasa del eje x más cercano; el valor es el mismo que el de 45°, solo cambia el signo.' },
      { paso: 'En el tercer cuadrante el coseno es negativo', porque: 'Ahí los puntos del círculo unitario tienen x negativa, y el coseno es la coordenada x.' },
      { paso: 'cos 225° = −cos 45° = −√2/2', porque: 'Usamos el valor conocido cos 45° = √2/2 con el signo del cuadrante.' },
    ],
    respuesta: '−√2/2',
    clave: 'Valor = el del ángulo de referencia; signo = el del cuadrante.',
  },
  {
    id: 'tri-4', tema: 'trigonometria', nivel: 'Avanzado', titulo: 'Ecuación trigonométrica',
    enunciado: 'Resuelve 2 sen x − √3 = 0 para 0° ≤ x < 360°',
    pasos: [
      { paso: 'sen x = √3/2', porque: 'Despejamos el seno: pasamos √3 sumando y el 2 dividiendo.' },
      { paso: 'Ángulo de referencia: 60°', porque: 'Sabemos que sen 60° = √3/2.' },
      { paso: 'El seno es positivo en el I y II cuadrante', porque: 'El seno es la coordenada y, y es positiva arriba del eje x.' },
      { paso: 'x = 60°  y  x = 180° − 60° = 120°', porque: 'En el II cuadrante el ángulo es 180° menos el de referencia.' },
    ],
    respuesta: 'x = 60° y x = 120°',
    clave: 'Despeja la función, halla el ángulo de referencia y revisa en qué cuadrantes tiene ese signo.',
  },

  // ================= LÍMITES =================
  {
    id: 'lim-1', tema: 'limites', nivel: 'Básico', titulo: 'Límite por sustitución',
    enunciado: 'Calcula el límite de x² + 3x − 1 cuando x → 2',
    pasos: [
      { paso: '2² + 3(2) − 1', porque: 'Es un polinomio: no tiene divisiones que se anulen, así que basta con reemplazar x por 2.' },
      { paso: '4 + 6 − 1 = 9', porque: 'Hacemos las operaciones.' },
    ],
    respuesta: '9',
    clave: 'Siempre intenta primero reemplazar. Si no sale 0/0 ni división por cero, ese es el límite.',
  },
  {
    id: 'lim-2', tema: 'limites', nivel: 'Intermedio', titulo: 'Indeterminación 0/0 factorizando',
    enunciado: 'Calcula el límite de (x² − 9)/(x − 3) cuando x → 3',
    pasos: [
      { paso: 'Al reemplazar: (9 − 9)/(3 − 3) = 0/0', porque: '0/0 no es un número: es una "indeterminación" que nos avisa que hay que simplificar.' },
      { paso: 'x² − 9 = (x − 3)(x + 3)', porque: 'Es una diferencia de cuadrados.' },
      { paso: '(x − 3)(x + 3)/(x − 3) = x + 3', porque: 'Cancelamos (x − 3). Se puede porque x se acerca a 3 pero nunca es exactamente 3.' },
      { paso: '3 + 3 = 6', porque: 'Ahora sí reemplazamos x por 3.' },
    ],
    respuesta: '6',
    clave: 'Con 0/0 factoriza y cancela el factor que causa el cero.',
  },
  {
    id: 'lim-3', tema: 'limites', nivel: 'Intermedio', titulo: 'Límite al infinito',
    enunciado: 'Calcula el límite de (3x² + 1)/(x² − 5) cuando x → ∞',
    pasos: [
      { paso: 'Dividimos todo entre x²', porque: 'x² es la potencia más alta; al dividir, los términos más pequeños se vuelven fáciles de analizar.' },
      { paso: '(3 + 1/x²)/(1 − 5/x²)', porque: 'Cada término dividido entre x².' },
      { paso: '1/x² → 0  y  5/x² → 0', porque: 'Un número fijo dividido entre algo enorme se acerca a cero.' },
      { paso: '(3 + 0)/(1 − 0) = 3', porque: 'Queda solo la división de los coeficientes principales.' },
    ],
    respuesta: '3',
    clave: 'Mismo grado arriba y abajo: el límite es la división de los coeficientes principales.',
  },
  {
    id: 'lim-4', tema: 'limites', nivel: 'Avanzado', titulo: 'Racionalizando',
    enunciado: 'Calcula el límite de (√(x + 4) − 2)/x cuando x → 0',
    pasos: [
      { paso: 'Al reemplazar: (2 − 2)/0 = 0/0', porque: 'Indeterminación: hay que transformar la expresión.' },
      { paso: 'Multiplicamos arriba y abajo por (√(x + 4) + 2)', porque: 'Es el "conjugado": sirve para eliminar la raíz usando (a − b)(a + b) = a² − b².' },
      { paso: 'Arriba queda (x + 4) − 4 = x', porque: 'La raíz al cuadrado se cancela con la raíz.' },
      { paso: 'x / (x(√(x + 4) + 2)) = 1/(√(x + 4) + 2)', porque: 'Cancelamos la x que causaba el cero.' },
      { paso: '1/(√4 + 2) = 1/4', porque: 'Ahora sí reemplazamos x = 0.' },
    ],
    respuesta: '1/4',
    clave: 'Si hay raíces y sale 0/0, multiplica por el conjugado.',
  },

  // ================= DERIVADAS =================
  {
    id: 'der-1', tema: 'derivadas', nivel: 'Básico', titulo: 'Regla de la potencia',
    enunciado: 'Deriva f(x) = 4x³ − 5x² + 7',
    pasos: [
      { paso: 'd/dx(4x³) = 4·3x² = 12x²', porque: 'Regla de la potencia: el exponente baja multiplicando y se le resta 1.' },
      { paso: 'd/dx(−5x²) = −5·2x = −10x', porque: 'Misma regla; el número que multiplica se queda.' },
      { paso: 'd/dx(7) = 0', porque: 'Una constante no cambia, así que su derivada (su ritmo de cambio) es cero.' },
      { paso: "f'(x) = 12x² − 10x", porque: 'Juntamos los resultados: la derivada de una suma es la suma de las derivadas.' },
    ],
    respuesta: "f'(x) = 12x² − 10x",
    clave: 'd/dx(xⁿ) = n·xⁿ⁻¹ y la derivada de una constante es 0.',
  },
  {
    id: 'der-2', tema: 'derivadas', nivel: 'Intermedio', titulo: 'Regla del producto',
    enunciado: 'Deriva f(x) = x² · sen x',
    pasos: [
      { paso: 'u = x²,  v = sen x', porque: 'Es una multiplicación de dos funciones, así que usamos la regla del producto.' },
      { paso: "u' = 2x,  v' = cos x", porque: 'Derivamos cada parte por separado.' },
      { paso: "f'(x) = u'·v + u·v'", porque: 'Regla del producto: la derivada del primero por el segundo, más el primero por la derivada del segundo.' },
      { paso: "f'(x) = 2x·sen x + x²·cos x", porque: 'Reemplazamos cada parte.' },
    ],
    respuesta: "f'(x) = 2x sen x + x² cos x",
    clave: '(u·v)\' = u\'·v + u·v\'. ¡No es solo multiplicar las derivadas!',
  },
  {
    id: 'der-3', tema: 'derivadas', nivel: 'Intermedio', titulo: 'Regla de la cadena',
    enunciado: 'Deriva f(x) = (3x² + 1)⁵',
    pasos: [
      { paso: 'Función de afuera: ( )⁵,  función de adentro: 3x² + 1', porque: 'Hay una función dentro de otra; la regla de la cadena deriva "de afuera hacia adentro".' },
      { paso: 'Derivada de afuera: 5(3x² + 1)⁴', porque: 'Derivamos la potencia dejando lo de adentro igual.' },
      { paso: 'Derivada de adentro: 6x', porque: 'd/dx(3x² + 1) = 6x.' },
      { paso: "f'(x) = 5(3x² + 1)⁴ · 6x = 30x(3x² + 1)⁴", porque: 'Regla de la cadena: se multiplican ambas derivadas.' },
    ],
    respuesta: "f'(x) = 30x(3x² + 1)⁴",
    clave: 'Cadena: derivada de afuera (sin tocar lo de adentro) × derivada de adentro.',
  },
  {
    id: 'der-4', tema: 'derivadas', nivel: 'Avanzado', titulo: 'Recta tangente',
    enunciado: 'Halla la recta tangente a f(x) = x² − 4x en x = 3',
    pasos: [
      { paso: 'f(3) = 9 − 12 = −3  →  punto (3, −3)', porque: 'La recta tangente toca la curva en ese punto, así que lo necesitamos.' },
      { paso: "f'(x) = 2x − 4", porque: 'La derivada da la pendiente de la curva en cada punto.' },
      { paso: "m = f'(3) = 2", porque: 'La pendiente de la tangente es la derivada evaluada en x = 3.' },
      { paso: 'y − (−3) = 2(x − 3)  →  y = 2x − 9', porque: 'Usamos punto-pendiente: y − y₁ = m(x − x₁), y despejamos y.' },
    ],
    respuesta: 'y = 2x − 9',
    clave: 'Tangente: punto (x₀, f(x₀)) y pendiente f\'(x₀).',
  },

  // ================= INTEGRALES =================
  {
    id: 'int-1', tema: 'integrales', nivel: 'Básico', titulo: 'Integral inmediata',
    enunciado: 'Calcula ∫ (6x² + 4x − 3) dx',
    pasos: [
      { paso: '∫ 6x² dx = 6·x³/3 = 2x³', porque: 'Regla de la potencia para integrar: se suma 1 al exponente y se divide entre el nuevo exponente.' },
      { paso: '∫ 4x dx = 4·x²/2 = 2x²', porque: 'Misma regla: x¹ pasa a x²/2.' },
      { paso: '∫ −3 dx = −3x', porque: 'La integral de una constante es la constante por x.' },
      { paso: '2x³ + 2x² − 3x + C', porque: 'Se suma C porque cualquier constante desaparece al derivar; no sabemos cuál era.' },
    ],
    respuesta: '2x³ + 2x² − 3x + C',
    clave: '∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C (para n ≠ −1). Nunca olvides la + C.',
  },
  {
    id: 'int-2', tema: 'integrales', nivel: 'Intermedio', titulo: 'Integral definida',
    enunciado: 'Calcula ∫ de 0 a 2 de (3x² + 1) dx',
    pasos: [
      { paso: 'Primitiva: F(x) = x³ + x', porque: 'Integramos como siempre (en la definida no hace falta la + C porque se cancela).' },
      { paso: 'F(2) = 8 + 2 = 10', porque: 'Evaluamos en el límite de arriba.' },
      { paso: 'F(0) = 0', porque: 'Evaluamos en el límite de abajo.' },
      { paso: 'F(2) − F(0) = 10', porque: 'Teorema fundamental del cálculo: arriba menos abajo.' },
    ],
    respuesta: '10',
    clave: 'Definida: integra y luego resta F(b) − F(a). El resultado es un número (un área).',
  },
  {
    id: 'int-3', tema: 'integrales', nivel: 'Intermedio', titulo: 'Sustitución (cambio de variable)',
    enunciado: 'Calcula ∫ 2x(x² + 1)³ dx',
    pasos: [
      { paso: 'u = x² + 1', porque: 'Elegimos como u lo que está "adentro" y cuya derivada aparece afuera.' },
      { paso: 'du = 2x dx', porque: 'Derivamos u; justo 2x dx está en la integral.' },
      { paso: '∫ u³ du = u⁴/4 + C', porque: 'La integral queda simple y usamos la regla de la potencia.' },
      { paso: '(x² + 1)⁴/4 + C', porque: 'Volvemos a escribir en términos de x.' },
    ],
    respuesta: '(x² + 1)⁴/4 + C',
    clave: 'Sustitución: busca una función cuya derivada también esté en la integral.',
  },
  {
    id: 'int-4', tema: 'integrales', nivel: 'Avanzado', titulo: 'Integración por partes',
    enunciado: 'Calcula ∫ x·eˣ dx',
    pasos: [
      { paso: 'u = x,  dv = eˣ dx', porque: 'Elegimos como u lo que se simplifica al derivar (x → 1).' },
      { paso: 'du = dx,  v = eˣ', porque: 'Derivamos u e integramos dv.' },
      { paso: '∫ u dv = u·v − ∫ v du = x·eˣ − ∫ eˣ dx', porque: 'Fórmula de integración por partes.' },
      { paso: 'x·eˣ − eˣ + C = eˣ(x − 1) + C', porque: 'La integral que quedó es inmediata y sacamos factor común.' },
    ],
    respuesta: 'eˣ(x − 1) + C',
    clave: 'Por partes: ∫ u dv = uv − ∫ v du. Escoge u para que al derivarla se simplifique.',
  },
];
