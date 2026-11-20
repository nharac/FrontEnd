/** Funciones para graficar, con su derivada y una primitiva (para el área bajo la curva). */
export interface FuncionGrafica {
  id: string;
  nombre: string;
  derivadaTexto: string;
  f: (x: number) => number;
  df: (x: number) => number;
  F: (x: number) => number;
}

export const FUNCIONES: FuncionGrafica[] = [
  { id: 'cuadratica', nombre: 'f(x) = x²', derivadaTexto: "f'(x) = 2x", f: x => x * x, df: x => 2 * x, F: x => x ** 3 / 3 },
  { id: 'cubica', nombre: 'f(x) = x³ − 3x', derivadaTexto: "f'(x) = 3x² − 3", f: x => x ** 3 - 3 * x, df: x => 3 * x * x - 3, F: x => x ** 4 / 4 - 1.5 * x * x },
  { id: 'seno', nombre: 'f(x) = sen x', derivadaTexto: "f'(x) = cos x", f: Math.sin, df: Math.cos, F: x => -Math.cos(x) },
  { id: 'coseno', nombre: 'f(x) = cos x', derivadaTexto: "f'(x) = −sen x", f: Math.cos, df: x => -Math.sin(x), F: Math.sin },
  { id: 'exponencial', nombre: 'f(x) = eˣ', derivadaTexto: "f'(x) = eˣ", f: Math.exp, df: Math.exp, F: Math.exp },
];

/** Ventana del plano: x e y entre −RANGO y RANGO. */
export const RANGO = 5;

/** Convierte puntos del plano a un "path" de SVG en un lienzo de lado×lado; corta donde la función se sale. */
export function trazo(fn: (x: number) => number, lado: number, desde = -RANGO, hasta = RANGO): string {
  const escala = lado / (2 * RANGO);
  const pasos = 240;
  let d = '';
  let dentro = false;
  for (let i = 0; i <= pasos; i++) {
    const x = desde + ((hasta - desde) * i) / pasos;
    const y = fn(x);
    if (!Number.isFinite(y) || Math.abs(y) > RANGO * 3) { dentro = false; continue; }
    const px = (x + RANGO) * escala;
    const py = (RANGO - y) * escala;
    d += `${dentro ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)} `;
    dentro = true;
  }
  return d.trim();
}

/** Región entre la curva y el eje x en [a, b], como polígono de SVG. */
export function area(fn: (x: number) => number, a: number, b: number, lado: number): string {
  const escala = lado / (2 * RANGO);
  const y0 = RANGO * escala;
  const curva = trazo(x => Math.max(-RANGO * 3, Math.min(RANGO * 3, fn(x))), lado, a, b);
  if (!curva) return '';
  const xa = ((a + RANGO) * escala).toFixed(1);
  const xb = ((b + RANGO) * escala).toFixed(1);
  return `M${xa},${y0} ${curva.replace(/^M/, 'L')} L${xb},${y0} Z`;
}
