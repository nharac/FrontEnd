/**
 * Convierte el texto del tutor IA en HTML sencillo y seguro.
 *
 * Gemini suele responder con markdown (**negrita**, listas) y a veces con
 * fórmulas en LaTeX ($x^2$, \frac{a}{b}). Aquí se pasa todo a algo legible:
 * - Primero se escapa el HTML, así nada de lo que escriba la IA se interpreta como etiqueta.
 * - Luego se aplican negrita, cursiva, código, listas, saltos de línea y exponentes (x^2 → x²).
 * El resultado se enlaza con [innerHTML] (Angular además lo sanea).
 */

const LATEX: [RegExp, string][] = [
  [/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)'],
  [/\\sqrt\{([^{}]+)\}/g, '√($1)'],
  [/\\int/g, '∫'],
  [/\\infty/g, '∞'],
  [/\\(?:to|rightarrow)/g, '→'],
  [/\\cdot/g, '·'],
  [/\\times/g, '×'],
  [/\\pi/g, 'π'],
  [/\\(?:le|leq)/g, '≤'],
  [/\\(?:ge|geq)/g, '≥'],
  [/\\neq/g, '≠'],
  [/\\(lim|sin|cos|tan|ln|log|sec|csc|cot|e)\b/g, '$1'],
  [/\\left|\\right|\\,|\\;|\\!/g, ''],
];

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Pasa LaTeX básico a texto y quita los delimitadores $...$, \( \) y \[ \]. */
function simplificarLatex(texto: string): string {
  let t = texto.replace(/\$\$?|\\\(|\\\)|\\\[|\\\]/g, '');
  for (const [patron, reemplazo] of LATEX) {
    t = t.replace(patron, reemplazo);
  }
  // Llaves sueltas que quedan de LaTeX: x_{1} → x_1 (pero se conservan las de ^{...})
  return t.replace(/(^|[^^])\{([^{}]*)\}/g, '$1$2');
}

/** Negrita, cursiva, código y exponentes dentro de una línea ya escapada. */
function formatoEnLinea(linea: string): string {
  return linea
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>')
    .replace(/\^\(([^()]+)\)/g, '<sup>($1)</sup>')
    .replace(/\^(-?[\w.]+)/g, '<sup>$1</sup>');
}

export function formatearMensaje(texto: string | null | undefined): string {
  if (!texto) {
    return '';
  }

  const lineas = escaparHtml(simplificarLatex(texto)).split(/\r?\n/);
  const bloques: string[] = [];
  let lista: { tipo: 'ul' | 'ol'; items: string[] } | null = null;
  let parrafo: string[] = [];

  const cerrarParrafo = () => {
    if (parrafo.length) {
      bloques.push(`<p>${parrafo.join('<br>')}</p>`);
      parrafo = [];
    }
  };
  const cerrarLista = () => {
    if (lista) {
      bloques.push(`<${lista.tipo}>${lista.items.map(i => `<li>${i}</li>`).join('')}</${lista.tipo}>`);
      lista = null;
    }
  };

  for (const cruda of lineas) {
    const linea = cruda.trim();
    const vineta = /^[-*•]\s+(.*)$/.exec(linea);
    const numerada = /^\d+[.)]\s+(.*)$/.exec(linea);

    if (vineta || numerada) {
      cerrarParrafo();
      const tipo = vineta ? 'ul' : 'ol';
      if (lista && lista.tipo !== tipo) {
        cerrarLista();
      }
      lista ??= { tipo, items: [] };
      lista.items.push(formatoEnLinea((vineta ?? numerada)![1]));
    } else if (!linea) {
      cerrarParrafo();
      cerrarLista();
    } else {
      cerrarLista();
      // Títulos markdown (### Paso 1) se muestran como negrita
      const titulo = /^#{1,6}\s+(.*)$/.exec(linea);
      parrafo.push(titulo ? `<strong>${formatoEnLinea(titulo[1])}</strong>` : formatoEnLinea(linea));
    }
  }
  cerrarParrafo();
  cerrarLista();
  return bloques.join('');
}
