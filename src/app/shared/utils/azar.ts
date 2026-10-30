/**
 * Número al azar entre 0 (incluido) y 1 (excluido), como Math.random(),
 * pero tomado de crypto.getRandomValues(). Se usa para efectos visuales
 * (confeti, frase de Sumi); así SonarQube no lo marca como generador inseguro (S2245).
 */
export function azar(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 4_294_967_296;
}
