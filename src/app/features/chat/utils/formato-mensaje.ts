/**
 * Convierte el texto del tutor IA en HTML sencillo y seguro.
 *
 * Gemini suele responder con markdown (**negrita**, listas) y con fórmulas en LaTeX
 * ($x^2 - 9$, $$\frac{a}{b}$$). Aquí se pasa todo a algo legible:
 * - Las fórmulas se apartan y quedan en <span class="tex">…</span> (texto escapado); el chat las
 *   dibuja después con KaTeX (ver dibujarFormulas). Si KaTeX no puede, se muestran simplificadas.
 * - El resto se escapa, así nada de lo que escriba la IA se interpreta como etiqueta.
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

/** Respaldo sin KaTeX: pasa LaTeX básico a texto y quita los delimitadores $...$, \( \) y \[ \]. */
export function simplificarLatex(texto: string, quitarDelimitadores = true): string {
  // Fuera de las fórmulas un $ suelto es un signo de pesos y se deja
  let t = quitarDelimitadores ? texto.replace(/\$\$?|\\\(|\\\)|\\\[|\\\]/g, '') : texto;
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

/** Marca que reemplaza cada fórmula mientras se procesa el markdown (caracteres que la IA no escribe). */
const MARCA = (i: number) => `\u0001${i}\u0002`;
const MARCA_RE = /\u0001(\d+)\u0002/g;

/** Delimitadores de fórmula: los de bloque se dibujan centrados en su propia línea. */
const DELIMITADORES = [
  { abre: '$$', cierra: '$$', bloque: true },
  { abre: '\\[', cierra: '\\]', bloque: true },
  { abre: '\\(', cierra: '\\)', bloque: false },
  { abre: '$', cierra: '$', bloque: false },
];

/**
 * Aparta las fórmulas y deja una marca en su lugar. Se recorre el texto a mano (sin regex)
 * para que no haya backtracking. En $…$ el contenido no puede empezar ni terminar con espacio
 * ni cruzar líneas, para no confundir precios como "$5 y $10".
 */
function apartarFormulas(texto: string): { sinFormulas: string; formulas: { tex: string; bloque: boolean }[] } {
  const formulas: { tex: string; bloque: boolean }[] = [];
  let sinFormulas = '';
  let i = 0;
  while (i < texto.length) {
    const d = DELIMITADORES.find(x => texto.startsWith(x.abre, i));
    if (d) {
      const inicio = i + d.abre.length;
      const fin = texto.indexOf(d.cierra, inicio);
      const tex = fin > inicio ? texto.slice(inicio, fin) : '';
      const valida = tex.trim() !== '' && (d.abre !== '$' || (!/^\s|\s$/.test(tex) && !tex.includes('\n')));
      if (valida) {
        formulas.push({ tex: tex.trim(), bloque: d.bloque });
        sinFormulas += MARCA(formulas.length - 1);
        i = fin + d.cierra.length;
        continue;
      }
    }
    sinFormulas += texto[i];
    i++;
  }
  return { sinFormulas, formulas };
}

export function formatearMensaje(texto: string | null | undefined): string {
  if (!texto) {
    return '';
  }

  const { sinFormulas, formulas } = apartarFormulas(texto);
  const html = formatearSinFormulas(sinFormulas);
  return html.replace(MARCA_RE, (_m, i: string) => {
    const f = formulas[Number(i)];
    return `<span class="tex${f.bloque ? ' tex--bloque' : ''}">${escaparHtml(f.tex)}</span>`;
  });
}

function formatearSinFormulas(texto: string): string {
  const lineas = escaparHtml(simplificarLatex(texto, false)).split(/\r?\n/);
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
    const vineta = /^[-*•]\s+(\S.*)$/.exec(linea);
    const numerada = /^\d+[.)]\s+(\S.*)$/.exec(linea);

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
      const titulo = /^#{1,6}\s+(\S.*)$/.exec(linea);
      parrafo.push(titulo ? `<strong>${formatoEnLinea(titulo[1])}</strong>` : formatoEnLinea(linea));
    }
  }
  cerrarParrafo();
  cerrarLista();
  return bloques.join('');
}
