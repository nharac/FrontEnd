import { TemaResuelto } from './ejercicios-resueltos';

/** Fórmula de consulta rápida, con una nota en lenguaje sencillo de cuándo usarla. */
export interface Formula {
  nombre: string;
  formula: string;
  nota: string;
}

export const FORMULAS: Record<TemaResuelto, Formula[]> = {
  fundamentos: [
    { nombre: 'Jerarquía de operaciones', formula: 'Paréntesis → Potencias → × ÷ → + −', nota: 'El orden en que se resuelve cualquier operación combinada.' },
    { nombre: 'Suma de fracciones', formula: 'a/b + c/d = (a·d + b·c) / (b·d)', nota: 'Primero se busca un denominador común.' },
    { nombre: 'Multiplicación de fracciones', formula: '(a/b) · (c/d) = (a·c) / (b·d)', nota: 'Arriba con arriba y abajo con abajo.' },
    { nombre: 'División de fracciones', formula: '(a/b) ÷ (c/d) = (a/b) · (d/c)', nota: 'Dividir es multiplicar por el inverso.' },
    { nombre: 'Producto de potencias', formula: 'aᵐ · aⁿ = aᵐ⁺ⁿ', nota: 'Misma base: los exponentes se suman.' },
    { nombre: 'Cociente de potencias', formula: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', nota: 'Misma base: los exponentes se restan.' },
    { nombre: 'Exponente cero y negativo', formula: 'a⁰ = 1     a⁻ⁿ = 1/aⁿ', nota: 'Válido para a distinto de cero.' },
    { nombre: 'Exponente fraccionario', formula: 'a^(m/n) = ⁿ√(aᵐ)', nota: 'El denominador del exponente es el índice de la raíz.' },
    { nombre: 'Porcentaje', formula: 'p % de N = (p/100) · N', nota: 'Un descuento del p % equivale a multiplicar por (1 − p/100).' },
  ],
  algebra: [
    { nombre: 'Cuadrado de un binomio', formula: '(a ± b)² = a² ± 2ab + b²', nota: 'No olvides el término del medio, 2ab.' },
    { nombre: 'Diferencia de cuadrados', formula: 'a² − b² = (a − b)(a + b)', nota: 'Muy útil para simplificar y para límites 0/0.' },
    { nombre: 'Trinomio x² + bx + c', formula: 'x² + bx + c = (x + m)(x + n), con m·n = c y m + n = b', nota: 'Busca dos números con ese producto y esa suma.' },
    { nombre: 'Suma y diferencia de cubos', formula: 'a³ ± b³ = (a ± b)(a² ∓ ab + b²)', nota: 'El signo del medio es el contrario.' },
    { nombre: 'Fórmula cuadrática', formula: 'x = (−b ± √(b² − 4ac)) / 2a', nota: 'Resuelve ax² + bx + c = 0.' },
    { nombre: 'Discriminante', formula: 'Δ = b² − 4ac', nota: 'Δ > 0: dos soluciones · Δ = 0: una · Δ < 0: ninguna real.' },
    { nombre: 'Pendiente de una recta', formula: 'm = (y₂ − y₁) / (x₂ − x₁)', nota: 'Cuánto sube la recta por cada unidad que avanza.' },
    { nombre: 'Recta punto-pendiente', formula: 'y − y₁ = m(x − x₁)', nota: 'Sirve con un punto y la pendiente.' },
    { nombre: 'Definición de logaritmo', formula: 'log_b(x) = y  ⇔  bʸ = x', nota: 'Un logaritmo pregunta "a qué exponente".' },
    { nombre: 'Propiedades de logaritmos', formula: 'log(ab) = log a + log b     log(a/b) = log a − log b     log(aⁿ) = n·log a', nota: 'Convierten productos en sumas.' },
  ],
  trigonometria: [
    { nombre: 'SOH-CAH-TOA', formula: 'sen θ = O/H     cos θ = A/H     tan θ = O/A', nota: 'O = opuesto, A = adyacente, H = hipotenusa.' },
    { nombre: 'Teorema de Pitágoras', formula: 'c² = a² + b²', nota: 'Solo en triángulos rectángulos; c es la hipotenusa.' },
    { nombre: 'Identidad pitagórica', formula: 'sen² x + cos² x = 1', nota: 'La más usada para simplificar.' },
    { nombre: 'Recíprocas', formula: 'sec x = 1/cos x     csc x = 1/sen x     cot x = 1/tan x', nota: 'Son "uno sobre" las básicas.' },
    { nombre: 'Grados y radianes', formula: '180° = π rad', nota: 'Grados → radianes: × π/180.' },
    { nombre: 'Valores notables', formula: 'sen 30° = 1/2   sen 45° = √2/2   sen 60° = √3/2', nota: 'El coseno es al revés: cos 30° = √3/2, cos 60° = 1/2.' },
    { nombre: 'Ángulo doble', formula: 'sen 2x = 2 sen x cos x     cos 2x = cos² x − sen² x', nota: 'Para simplificar y resolver ecuaciones.' },
    { nombre: 'Suma de ángulos', formula: 'sen(a ± b) = sen a cos b ± cos a sen b', nota: 'Permite calcular sen 75° = sen(45° + 30°).' },
    { nombre: 'Ley de senos', formula: 'a/sen A = b/sen B = c/sen C', nota: 'Cuando conoces dos ángulos y un lado.' },
    { nombre: 'Ley del coseno', formula: 'c² = a² + b² − 2ab cos C', nota: 'Cuando conoces dos lados y el ángulo entre ellos.' },
  ],
  limites: [
    { nombre: 'Sustitución directa', formula: 'lim(x→a) f(x) = f(a)', nota: 'Funciona si f es continua en a (polinomios, por ejemplo).' },
    { nombre: 'Indeterminación 0/0', formula: 'Factorizar, racionalizar o simplificar', nota: 'Elimina el factor que causa el cero.' },
    { nombre: 'Límite al infinito (mismo grado)', formula: 'lim(x→∞) (axⁿ + …)/(bxⁿ + …) = a/b', nota: 'Si el grado de arriba es menor el límite es 0; si es mayor, ±∞.' },
    { nombre: 'Límite notable del seno', formula: 'lim(x→0) sen x / x = 1', nota: 'Base de muchos límites trigonométricos.' },
    { nombre: 'Número e', formula: 'lim(x→∞) (1 + 1/x)ˣ = e', nota: 'e ≈ 2,718.' },
    { nombre: 'Laterales', formula: 'lim existe ⇔ lim(x→a⁻) = lim(x→a⁺)', nota: 'Si por izquierda y derecha dan distinto, no existe.' },
  ],
  derivadas: [
    { nombre: 'Potencia', formula: 'd/dx (xⁿ) = n·xⁿ⁻¹', nota: 'El exponente baja y se le resta 1.' },
    { nombre: 'Constante', formula: 'd/dx (c) = 0', nota: 'Lo que no cambia tiene derivada cero.' },
    { nombre: 'Producto', formula: '(u·v)′ = u′·v + u·v′', nota: 'No es multiplicar las derivadas.' },
    { nombre: 'Cociente', formula: '(u/v)′ = (u′·v − u·v′) / v²', nota: '"Baja por derivada de arriba, menos arriba por derivada de abajo, sobre abajo al cuadrado".' },
    { nombre: 'Regla de la cadena', formula: '[f(g(x))]′ = f′(g(x)) · g′(x)', nota: 'Derivada de afuera por derivada de adentro.' },
    { nombre: 'Trigonométricas', formula: '(sen x)′ = cos x     (cos x)′ = −sen x     (tan x)′ = sec² x', nota: 'Ojo con el signo del coseno.' },
    { nombre: 'Exponencial y logaritmo', formula: '(eˣ)′ = eˣ     (ln x)′ = 1/x', nota: 'eˣ es su propia derivada.' },
    { nombre: 'Recta tangente', formula: 'y − f(a) = f′(a)(x − a)', nota: 'La derivada en a es la pendiente.' },
  ],
  integrales: [
    { nombre: 'Potencia', formula: '∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C   (n ≠ −1)', nota: 'Se suma 1 al exponente y se divide entre él.' },
    { nombre: 'Uno sobre x', formula: '∫ 1/x dx = ln|x| + C', nota: 'El caso n = −1.' },
    { nombre: 'Exponencial', formula: '∫ eˣ dx = eˣ + C', nota: 'Igual que su derivada.' },
    { nombre: 'Trigonométricas', formula: '∫ sen x dx = −cos x + C     ∫ cos x dx = sen x + C', nota: 'Al revés que en derivadas, cuidado con el signo.' },
    { nombre: 'Sustitución', formula: '∫ f(g(x))·g′(x) dx = ∫ f(u) du,  con u = g(x)', nota: 'Busca una función cuya derivada también aparezca.' },
    { nombre: 'Por partes', formula: '∫ u dv = u·v − ∫ v du', nota: 'Escoge u para que al derivarla se simplifique (regla ILATE).' },
    { nombre: 'Teorema fundamental', formula: '∫ₐᵇ f(x) dx = F(b) − F(a)', nota: 'F es una primitiva de f; en la definida no va la C.' },
  ],
  algebra_lineal: [
    { nombre: 'Suma de matrices', formula: '(A + B)ᵢⱼ = aᵢⱼ + bᵢⱼ', nota: 'Solo entre matrices del mismo tamaño.' },
    { nombre: 'Producto de matrices', formula: '(AB)ᵢⱼ = fila i de A · columna j de B', nota: 'Columnas de A deben ser iguales a filas de B. AB ≠ BA en general.' },
    { nombre: 'Transpuesta', formula: '(Aᵀ)ᵢⱼ = aⱼᵢ', nota: 'Las filas pasan a ser columnas.' },
    { nombre: 'Determinante 2×2', formula: 'det [a b; c d] = ad − bc', nota: 'Si es 0 la matriz no tiene inversa.' },
    { nombre: 'Determinante 3×3', formula: 'det A = a₁₁M₁₁ − a₁₂M₁₂ + a₁₃M₁₃', nota: 'Cofactores por la primera fila con signos + − +.' },
    { nombre: 'Inversa 2×2', formula: '[a b; c d]⁻¹ = (1/(ad − bc)) · [d −b; −c a]', nota: 'Cambia a ↔ d, niega b y c y divide entre el determinante.' },
    { nombre: 'Operaciones de fila', formula: 'Fᵢ ↔ Fⱼ     Fᵢ → k·Fᵢ     Fᵢ → Fᵢ + k·Fⱼ', nota: 'No cambian las soluciones del sistema.' },
    { nombre: 'Gauss-Jordan', formula: '[A | b] → [I | x]', nota: 'Pivote en 1 y ceros arriba y abajo, columna por columna.' },
    { nombre: 'Inversa por Gauss-Jordan', formula: '[A | I] → [I | A⁻¹]', nota: 'Lo que se le hace a A se le hace a I.' },
  ],
};
