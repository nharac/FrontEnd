/** Colores de avatar (fondo, texto). Todos con contraste AA sobre el fondo. */
const PALETA: [string, string][] = [
  ['#e0e7ff', '#4338ca'],
  ['#dcfce7', '#15803d'],
  ['#fef3c7', '#b45309'],
  ['#fce7f3', '#be185d'],
  ['#e0f2fe', '#0369a1'],
  ['#ede9fe', '#6d28d9'],
  ['#ffedd5', '#c2410c'],
  ['#ccfbf1', '#0f766e'],
];

/**
 * Color estable para el avatar de una persona: el mismo nombre siempre da el mismo color,
 * así en el foro se reconoce a cada compañero de un vistazo.
 */
export function colorAvatar(nombre: string | null | undefined): { fondo: string; texto: string } {
  let hash = 0;
  for (const c of nombre ?? '') {
    hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  }
  const [fondo, texto] = PALETA[hash % PALETA.length];
  return { fondo, texto };
}
