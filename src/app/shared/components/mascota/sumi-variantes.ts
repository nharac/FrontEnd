/**
 * 500 variantes del vestidor de Sumi: cada diseño en varios colores.
 * Los dibujos se arman aquí al cargar (plantilla + colores) para no pesar en la descarga.
 * El backend tiene los mismos ids y precios (V26__sumi_500_variantes.sql).
 */
type Genero = 'm' | 'f' | 'mp' | 'fp';
/** [id, masculino, femenino, masc. plural, fem. plural, principal, oscuro, claro, recargo] */
type ColorPaleta = [string, string, string, string, string, string, string, string, number];
/** Color propio de una familia: [id, nombre, principal, oscuro, claro] */
type ColorPropio = [string, string, string, string, string];
export interface Familia {
  base: string;
  /** Nombre con {color} */
  nombre: string;
  genero: Genero;
  precio: number;
  descripcion: string;
  /** SVG con {C} principal, {D} oscuro y {L} claro */
  dibujo: string;
  /** Ropa: lo que va encima de los brazos (mangas, hombreras). */
  mangas?: string;
  /** Ropa: traje completo, reemplaza la bufanda. */
  traje?: boolean;
  /** Disfraz de cuerpo entero: tapa toda a Sumi menos la carita. */
  disfraz?: boolean;
  colores: (string | ColorPropio)[];
}
export interface Variante {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  dibujo: string;
  mangas?: string;
  traje?: boolean;
  disfraz?: boolean;
}
const PALETA: ColorPaleta[] = [
  ["rojo", "rojo", "roja", "rojos", "rojas", "#ef4444", "#b91c1c", "#fecaca", 0],
  ["naranja", "naranja", "naranja", "naranja", "naranja", "#f97316", "#c2410c", "#fed7aa", 0],
  ["amarillo", "amarillo", "amarilla", "amarillos", "amarillas", "#facc15", "#ca8a04", "#fef08a", 0],
  ["verde", "verde", "verde", "verdes", "verdes", "#22c55e", "#15803d", "#bbf7d0", 0],
  ["menta", "menta", "menta", "menta", "menta", "#2dd4bf", "#0f766e", "#ccfbf1", 0],
  ["azul", "azul", "azul", "azules", "azules", "#3b82f6", "#1d4ed8", "#bfdbfe", 0],
  ["indigo", "índigo", "índigo", "índigo", "índigo", "#6366f1", "#4338ca", "#c7d2fe", 0],
  ["morado", "morado", "morada", "morados", "moradas", "#a855f7", "#7e22ce", "#e9d5ff", 0],
  ["rosa", "rosa", "rosa", "rosa", "rosa", "#ec4899", "#be185d", "#fbcfe8", 0],
  ["cafe", "café", "café", "café", "café", "#92400e", "#451a03", "#fde68a", 0],
  ["negro", "negro", "negra", "negros", "negras", "#1f2937", "#030712", "#9ca3af", 0],
  ["blanco", "blanco", "blanca", "blancos", "blancas", "#f8fafc", "#94a3b8", "#ffffff", 0],
  ["dorado", "dorado", "dorada", "dorados", "doradas", "#eab308", "#a16207", "#fef3c7", 15],
];
const CABEZA: Familia[] = [
  { base: "gorro", nombre: "Gorro de lana {color}", genero: 'm', precio: 10, descripcion: "Calientito para el páramo.",
    dibujo: "<path fill=\"{C}\" d=\"M46 52 Q46 16 80 14 Q114 16 114 52 Z\"/><path fill=\"none\" stroke=\"{L}\" stroke-width=\"3\" stroke-linecap=\"round\" d=\"M50 32 Q80 24 110 32 M47 42 Q80 34 113 42\"/><path fill=\"#f8fafc\" stroke=\"#e2e8f0\" d=\"M42 48 Q80 58 118 48 L118 60 Q80 70 42 60 Z\"/><circle fill=\"#f8fafc\" stroke=\"#e2e8f0\" stroke-width=\"1.2\" cx=\"80\" cy=\"12\" r=\"9\"/>",
    colores: ["naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "cafe", "negro", "dorado"] },
  { base: "gorra", nombre: "Gorra {color}", genero: 'f', precio: 20, descripcion: "Con la integral bordada.",
    dibujo: "<path fill=\"{D}\" d=\"M56 50 Q36 46 22 56 Q44 62 70 54 Z\"/><path fill=\"{C}\" d=\"M50 54 Q50 20 80 18 Q110 20 110 54 Q80 46 50 54 Z\"/><path fill=\"none\" stroke=\"{L}\" stroke-width=\"1.4\" stroke-dasharray=\"3 2.4\" d=\"M80 19 V48\"/><circle fill=\"{D}\" cx=\"80\" cy=\"18\" r=\"3.5\"/><text x=\"95\" y=\"43\" text-anchor=\"middle\" fill=\"{L}\" font-family=\"Georgia, serif\" font-size=\"17\" font-weight=\"700\">∫</text>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "morado", "rosa", "cafe", "negro", "dorado"] },
  { base: "reves", nombre: "Gorra al revés {color}", genero: 'f', precio: 25, descripcion: "Estilo relajado.",
    dibujo: "<path fill=\"{D}\" d=\"M100 36 Q118 26 136 32 Q124 44 108 48 Z\"/><path fill=\"{C}\" d=\"M50 54 Q50 20 80 18 Q110 20 110 54 Q80 46 50 54 Z\"/><circle fill=\"{D}\" cx=\"80\" cy=\"18\" r=\"3.5\"/><path fill=\"none\" stroke=\"{L}\" stroke-width=\"1.4\" stroke-dasharray=\"3 2.4\" d=\"M80 19 V48\"/>",
    colores: ["rojo", "naranja", "amarillo", "menta", "azul", "indigo", "morado", "rosa", "cafe", "negro", "dorado"] },
  { base: "boina", nombre: "Boina {color}", genero: 'f', precio: 30, descripcion: "Estilo de artista.",
    dibujo: "<ellipse fill=\"{C}\" cx=\"76\" cy=\"42\" rx=\"38\" ry=\"14\" transform=\"rotate(-8 76 42)\"/><path fill=\"none\" stroke=\"{D}\" stroke-width=\"4\" stroke-linecap=\"round\" d=\"M52 52 Q80 60 106 50\"/><path fill=\"none\" stroke=\"{D}\" stroke-width=\"3\" stroke-linecap=\"round\" d=\"M72 30 q2 -6 6 -5\"/>",
    colores: ["naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "cafe", "negro", "dorado"] },
  { base: "copa", nombre: "Sombrero de copa con cinta {color}", genero: 'f', precio: 55, descripcion: "Elegancia en colores.",
    dibujo: "<ellipse fill=\"#111827\" cx=\"80\" cy=\"52\" rx=\"36\" ry=\"7\"/><path fill=\"#1f2937\" d=\"M62 52 V14 Q80 10 98 14 V52 Q80 56 62 52 Z\"/><path fill=\"{C}\" d=\"M62 44 Q80 48 98 44 V50 Q80 54 62 50 Z\"/><ellipse fill=\"#374151\" cx=\"80\" cy=\"14\" rx=\"18\" ry=\"4\"/>",
    colores: ["naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "blanco", "dorado"] },
  { base: "fiesta", nombre: "Gorro de fiesta {color}", genero: 'm', precio: 15, descripcion: "Para celebrar cada logro.",
    dibujo: "<path fill=\"{C}\" d=\"M80 6 L100 52 Q80 58 60 52 Z\"/><path fill=\"none\" stroke=\"{L}\" stroke-width=\"2.6\" stroke-linecap=\"round\" d=\"M72 24 L88 22 M66 38 L94 35 M62 48 L98 46\"/><circle fill=\"#fde047\" stroke=\"#eab308\" cx=\"80\" cy=\"6\" r=\"6\"/>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "indigo", "rosa", "cafe", "negro", "dorado"] },
  { base: "lazo", nombre: "Lazo {color}", genero: 'm', precio: 15, descripcion: "Como un regalo.",
    dibujo: "<path fill=\"{C}\" d=\"M80 36 L56 22 Q50 36 56 50 Z M80 36 L104 22 Q110 36 104 50 Z\"/><path fill=\"none\" stroke=\"{D}\" stroke-width=\"1.5\" d=\"M62 30 L74 35 M62 42 L74 37 M98 30 L86 35 M98 42 L86 37\"/><circle fill=\"{D}\" cx=\"80\" cy=\"36\" r=\"6\"/>",
    colores: ["naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "cafe", "negro", "dorado"] },
  { base: "gato", nombre: "Orejas de gato {color}", genero: 'fp', precio: 15, descripcion: "Miau-temáticas.",
    dibujo: "<path d=\"M42 66 Q44 28 80 26 Q116 28 118 66\" fill=\"none\" stroke=\"{C}\" stroke-width=\"4\" stroke-linecap=\"round\"/><path fill=\"{C}\" d=\"M50 44 L48 16 L70 32 Z M110 44 L112 16 L90 32 Z\"/><path fill=\"#f9a8d4\" d=\"M53 39 L52 23 L65 33 Z M107 39 L108 23 L95 33 Z\"/>",
    colores: ["blanco", "naranja", "cafe", "rosa", "morado", "azul", "dorado", "menta"] },
  { base: "dormir", nombre: "Gorro de dormir {color}", genero: 'm', precio: 15, descripcion: "Para soñar con derivadas.",
    dibujo: "<path fill=\"{C}\" d=\"M50 54 Q52 24 80 22 Q100 22 112 30 Q130 44 134 70 Q120 52 110 46 L112 54 Z\"/><g fill=\"{L}\"><circle cx=\"70\" cy=\"36\" r=\"1.8\"/><circle cx=\"90\" cy=\"30\" r=\"1.8\"/><circle cx=\"104\" cy=\"40\" r=\"1.8\"/></g><path fill=\"#f8fafc\" d=\"M46 50 Q80 60 114 50 L114 58 Q80 68 46 58 Z\"/><circle fill=\"#fde047\" cx=\"134\" cy=\"72\" r=\"6\"/>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "indigo", "morado", "rosa", "cafe", "negro"] },
  { base: "bici", nombre: "Casco de bici {color}", genero: 'm', precio: 25, descripcion: "A pedalear a la U.",
    dibujo: "<path fill=\"{C}\" d=\"M46 54 Q48 22 80 20 Q112 22 114 54 Q80 46 46 54 Z\"/><g fill=\"{D}\"><ellipse cx=\"66\" cy=\"32\" rx=\"3\" ry=\"7\" transform=\"rotate(-25 66 32)\"/><ellipse cx=\"80\" cy=\"29\" rx=\"3\" ry=\"8\"/><ellipse cx=\"94\" cy=\"32\" rx=\"3\" ry=\"7\" transform=\"rotate(25 94 32)\"/></g><path fill=\"{D}\" d=\"M48 52 L40 60 L58 56 Z\"/>",
    colores: ["rojo", "naranja", "amarillo", "verde", "azul", "indigo", "morado", "rosa", "cafe", "negro"] },
  { base: "vincha", nombre: "Vincha {color}", genero: 'f', precio: 10, descripcion: "Lista para el deporte.",
    dibujo: "<path fill=\"{C}\" d=\"M38 88 Q80 76 122 88 L122 97 Q80 85 38 97 Z\"/><path fill=\"none\" stroke=\"{L}\" stroke-width=\"1.8\" d=\"M40 92.5 Q80 81 120 92.5\"/><path fill=\"{C}\" d=\"M39 90 L27 94 L31 101 Z M39 94 L26 104 L34 106 Z\"/>",
    colores: ["naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "cafe", "negro"] },
  { base: "coronagema", nombre: "Corona de {color}", genero: 'f', precio: 120, descripcion: "Brilla como una joya.",
    dibujo: "<path fill=\"#facc15\" stroke=\"#ca8a04\" stroke-width=\"2\" stroke-linejoin=\"round\" d=\"M56 50 L54 22 L67 34 L80 14 L93 34 L106 22 L104 50 Q80 56 56 50 Z\"/><circle fill=\"{C}\" stroke=\"#fff\" cx=\"80\" cy=\"40\" r=\"5\"/><g fill=\"{C}\" stroke=\"#fff\"><circle cx=\"66\" cy=\"42\" r=\"3\"/><circle cx=\"94\" cy=\"42\" r=\"3\"/></g><g fill=\"{L}\" stroke=\"#ca8a04\" stroke-width=\"1.2\"><circle cx=\"54\" cy=\"21\" r=\"3\"/><circle cx=\"80\" cy=\"13\" r=\"3.4\"/><circle cx=\"106\" cy=\"21\" r=\"3\"/></g>",
    colores: [["rubi", "rubí", "#e11d48", "#9f1239", "#fecdd3"], ["zafiro", "zafiro", "#2563eb", "#1e3a8a", "#bfdbfe"], ["esmeralda", "esmeralda", "#059669", "#064e3b", "#a7f3d0"], ["amatista", "amatista", "#9333ea", "#581c87", "#e9d5ff"], ["topacio", "topacio", "#f59e0b", "#b45309", "#fde68a"], ["aguamarina", "aguamarina", "#06b6d4", "#0e7490", "#cffafe"], ["onix", "ónix", "#111827", "#000000", "#9ca3af"], ["opalo", "ópalo", "#f0abfc", "#a21caf", "#fdf4ff"]] },
  { base: "bandana", nombre: "Bandana {color}", genero: 'f', precio: 30, descripcion: "Atada con estilo.",
    dibujo: "<path fill=\"{C}\" d=\"M46 56 Q46 28 80 26 Q114 28 114 56 Q80 48 46 56 Z\"/><g fill=\"none\" stroke=\"{L}\" stroke-width=\"1.6\"><path d=\"M60 40 q4 -6 8 0 q-4 4 -8 0 Z\"/><path d=\"M84 34 q4 -6 8 0 q-4 4 -8 0 Z\"/><path d=\"M96 46 q4 -6 8 0 q-4 4 -8 0 Z\"/><path d=\"M70 50 q4 -6 8 0 q-4 4 -8 0 Z\"/></g><path fill=\"{D}\" d=\"M112 50 L127 45 L122 56 Z M112 52 L125 61 L114 63 Z\"/>",
    colores: ["azul", "negro", "verde", "amarillo", "morado", "rosa", "naranja", "cafe"] },
];
const CARA: Familia[] = [
  { base: "sol", nombre: "Gafas de sol {color}", genero: 'fp', precio: 30, descripcion: "Demasiado cool para el parcial.",
    dibujo: "<g fill=\"{D}\" opacity=\".9\"><path d=\"M52 99 H77 Q77 115 64.5 115 Q52 115 52 99 Z\"/><path d=\"M83 99 H108 Q108 115 95.5 115 Q83 115 83 99 Z\"/></g><path fill=\"none\" stroke=\"{C}\" stroke-width=\"2.6\" stroke-linecap=\"round\" d=\"M52 99 H108 M77 101 Q80 98 83 101 M52 100 L42 97 M108 100 L118 97\"/><path fill=\"none\" stroke=\"rgba(255,255,255,.7)\" stroke-width=\"1.8\" stroke-linecap=\"round\" d=\"M57 102 l5 0 M88 102 l5 0\"/>",
    colores: ["rojo", "naranja", "amarillo", "verde", "azul", "indigo", "morado", "rosa", "cafe", "dorado"] },
  { base: "redondas", nombre: "Gafas redondas {color}", genero: 'fp', precio: 20, descripcion: "Lectura con estilo.",
    dibujo: "<g fill=\"rgba(255,255,255,.25)\" stroke=\"{C}\" stroke-width=\"3\"><circle cx=\"65\" cy=\"106\" r=\"10.5\"/><circle cx=\"95\" cy=\"106\" r=\"10.5\"/></g><path fill=\"none\" stroke=\"{C}\" stroke-width=\"2.6\" stroke-linecap=\"round\" d=\"M75.5 104 Q80 100 84.5 104 M54.5 104 L44 100 M105.5 104 L116 100\"/>",
    colores: ["rojo", "naranja", "verde", "azul", "indigo", "morado", "rosa", "cafe", "negro", "dorado"] },
  { base: "corazon", nombre: "Gafas de corazón {color}", genero: 'fp', precio: 45, descripcion: "Puro amor.",
    dibujo: "<g fill=\"{C}\" fill-opacity=\".85\" stroke=\"{D}\" stroke-width=\"2\"><path d=\"M65 116 C 50 107 52 95 59 95 C 62.5 95 65 98 65 100 C 65 98 67.5 95 71 95 C 78 95 80 107 65 116 Z\"/><path d=\"M95 116 C 80 107 82 95 89 95 C 92.5 95 95 98 95 100 C 95 98 97.5 95 101 95 C 108 95 110 107 95 116 Z\"/></g><path fill=\"none\" stroke=\"{D}\" stroke-width=\"2.2\" stroke-linecap=\"round\" d=\"M77.5 101 Q80 98.5 82.5 101 M53 101 L43 97 M107 101 L117 97\"/>",
    colores: ["rojo", "morado", "azul", "negro", "dorado", "naranja", "verde", "menta"] },
  { base: "estrella", nombre: "Gafas de estrella {color}", genero: 'fp', precio: 60, descripcion: "Una verdadera estrella.",
    dibujo: "<g fill=\"{C}\" fill-opacity=\".85\" stroke=\"{D}\" stroke-width=\"1.8\" stroke-linejoin=\"round\"><path d=\"M65.0 93.5 L68.5 101.1 L76.9 102.1 L70.7 107.9 L72.3 116.1 L65.0 112.0 L57.7 116.1 L59.3 107.9 L53.1 102.1 L61.5 101.1 Z\"/><path d=\"M95.0 93.5 L98.5 101.1 L106.9 102.1 L100.7 107.9 L102.3 116.1 L95.0 112.0 L87.7 116.1 L89.3 107.9 L83.1 102.1 L91.5 101.1 Z\"/></g><path fill=\"none\" stroke=\"{D}\" stroke-width=\"2\" stroke-linecap=\"round\" d=\"M76 104 Q80 101 84 104 M54 102 L43 98 M106 102 L117 98\"/>",
    colores: ["rosa", "azul", "verde", "morado", "rojo", "naranja", "menta", "blanco"] },
  { base: "antifaz", nombre: "Antifaz {color}", genero: 'm', precio: 40, descripcion: "Superhéroe de las matemáticas.",
    dibujo: "<path fill=\"{C}\" fill-rule=\"evenodd\" d=\"M50 100 Q65 92 80 101 Q95 92 110 100 Q112 112 98 114 Q88 114 80 108 Q72 114 62 114 Q48 112 50 100 Z M58 106 a7 6 0 1 0 14 0 a7 6 0 1 0 -14 0 Z M88 106 a7 6 0 1 0 14 0 a7 6 0 1 0 -14 0 Z\"/><path fill=\"none\" stroke=\"{C}\" stroke-width=\"2.4\" stroke-linecap=\"round\" d=\"M50 102 L38 97 M50 105 L39 110\"/>",
    colores: ["rojo", "negro", "verde", "morado", "rosa", "naranja", "dorado", "menta"] },
  { base: "bigote", nombre: "Bigote {color}", genero: 'm', precio: 15, descripcion: "Muy distinguido.",
    dibujo: "<path fill=\"{C}\" d=\"M80 115.5 q-5 -4.5 -11 -1.5 q-6 3 -11 -0.5 q3 7.5 11 6.5 q7 -1 11 -4.5 q4 3.5 11 4.5 q8 1 11 -6.5 q-5 3.5 -11 0.5 q-6 -3 -11 1.5 Z\"/>",
    colores: [["pelirrojo", "pelirrojo", "#c2410c", "#7c2d12", "#fed7aa"], ["rubio", "rubio", "#eab308", "#a16207", "#fef08a"], ["canoso", "canoso", "#cbd5e1", "#64748b", "#f1f5f9"], ["negro", "negro", "#111827", "#000000", "#6b7280"], ["castano", "castaño", "#78350f", "#451a03", "#d6a35c"]] },
  { base: "rubor", nombre: "Rubor {color}", genero: 'm', precio: 10, descripcion: "Mejillas con color.",
    dibujo: "<g fill=\"{C}\" opacity=\".55\"><ellipse cx=\"53\" cy=\"117\" rx=\"8.5\" ry=\"5\"/><ellipse cx=\"107\" cy=\"117\" rx=\"8.5\" ry=\"5\"/></g>",
    colores: ["rosa", "rojo", "naranja", "morado", "azul", "dorado", "menta", "verde"] },
  { base: "visor", nombre: "Visor {color}", genero: 'm', precio: 80, descripcion: "Directo del año 3000.",
    dibujo: "<path fill=\"{C}\" fill-opacity=\".82\" stroke=\"{D}\" stroke-width=\"2\" d=\"M44 98 Q80 92 116 98 L116 114 Q80 108 44 114 Z\"/><path fill=\"none\" stroke=\"rgba(255,255,255,.75)\" stroke-width=\"2\" stroke-linecap=\"round\" d=\"M52 101 Q80 96 108 101\"/>",
    colores: ["rojo", "verde", "morado", "rosa", "naranja", "dorado", "azul", "negro"] },
  { base: "calcomania", nombre: "Calcomanías de {color}", genero: 'fp', precio: 15, descripcion: "Pegaditas en las mejillas.",
    dibujo: "<g fill=\"{C}\" stroke=\"{D}\" stroke-width=\".8\"><path transform=\"translate(53 117)\" d=\"{L}\"/><path transform=\"translate(107 117)\" d=\"{L}\"/></g>",
    colores: [["corazones", "corazones", "#f43f5e", "#be123c", "M0 4 c-5 -3 -4.5 -7 -2 -7 c1 0 2 1 2 2 c0 -1 1 -2 2 -2 c2.5 0 3 4 -2 7 Z"], ["rayos", "rayos", "#facc15", "#ca8a04", "M1 -6 L-3 1 H0 L-1 6 L3 -1 H0 Z"], ["lunas", "lunas", "#a5b4fc", "#6366f1", "M1 -5 a5 5 0 1 0 3 9 a4 4 0 1 1 -3 -9 Z"], ["flores", "flores", "#f472b6", "#db2777", "M0 -4 a2 2 0 1 1 0.1 0 M4 0 a2 2 0 1 1 0 0.1 M0 4 a2 2 0 1 1 -0.1 0 M-4 0 a2 2 0 1 1 0 -0.1 M0 0 m-1.5 0 a1.5 1.5 0 1 0 3 0 a1.5 1.5 0 1 0 -3 0"], ["gotas", "gotas", "#38bdf8", "#0284c7", "M0 -6 Q4 0 3 2 Q2 5 0 5 Q-2 5 -3 2 Q-4 0 0 -6 Z"]] },
];
const MANO: Familia[] = [
  { base: "globo", nombre: "Globo {color}", genero: 'm', precio: 10, descripcion: "Para la fiesta del 5.0.",
    dibujo: "<path fill=\"none\" stroke=\"#64748b\" stroke-width=\"1.2\" d=\"M22 122 Q17 134 26 144 Q31 149 30 152\"/><ellipse fill=\"{C}\" cx=\"22\" cy=\"104\" rx=\"13\" ry=\"16\"/><path fill=\"{C}\" d=\"M19 121 L25 121 L22 118 Z\"/><path fill=\"none\" stroke=\"rgba(255,255,255,.6)\" stroke-width=\"2.4\" stroke-linecap=\"round\" d=\"M15 98 Q16 93 20 91\"/>",
    colores: ["naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "cafe", "negro", "blanco", "dorado"] },
  { base: "helado", nombre: "Helado de {color}", genero: 'm', precio: 10, descripcion: "Una bola, dos bolas, ¡tres!",
    dibujo: "<path fill=\"#f59e0b\" d=\"M15 140 L33 140 L24 166 Z\"/><path fill=\"none\" stroke=\"#b45309\" stroke-width=\"1\" d=\"M17 145 L29 152 M19 150 L27 157 M31 145 L19 152 M29 150 L21 157\"/><g fill=\"{C}\"><circle cx=\"18\" cy=\"136\" r=\"7.5\"/><circle cx=\"30\" cy=\"136\" r=\"7.5\"/><circle cx=\"24\" cy=\"128\" r=\"7.5\"/></g><g fill=\"{L}\" opacity=\".7\"><circle cx=\"16\" cy=\"133\" r=\"2\"/><circle cx=\"27\" cy=\"133\" r=\"2\"/><circle cx=\"21\" cy=\"125\" r=\"2\"/></g>",
    colores: [["fresa", "fresa", "#f472b6", "#be185d", "#fce7f3"], ["chocolate", "chocolate", "#78350f", "#451a03", "#d6a35c"], ["vainilla", "vainilla", "#fef3c7", "#d6a35c", "#ffffff"], ["menta", "menta", "#86efac", "#15803d", "#f0fdf4"], ["mora", "mora", "#7e22ce", "#4c1d95", "#e9d5ff"], ["mango", "mango", "#fbbf24", "#d97706", "#fef3c7"], ["limon", "limón", "#bef264", "#65a30d", "#f7fee7"], ["chicle", "chicle", "#93c5fd", "#2563eb", "#eff6ff"], ["arequipe", "arequipe", "#d97706", "#92400e", "#fde68a"], ["coco", "coco", "#f5f5f4", "#a8a29e", "#ffffff"]] },
  { base: "chupeta", nombre: "Chupeta {color}", genero: 'f', precio: 5, descripcion: "Bombombúm de colores.",
    dibujo: "<path fill=\"none\" stroke=\"#f8fafc\" stroke-width=\"2.6\" stroke-linecap=\"round\" d=\"M28 160 L22 132\"/><circle fill=\"{C}\" cx=\"20\" cy=\"122\" r=\"11\"/><path fill=\"none\" stroke=\"{L}\" stroke-width=\"2.2\" d=\"M20 122 m-1 0 a1.5 1.5 0 1 1 3 0 a3.5 3.5 0 1 1 -7 0 a5.5 5.5 0 1 1 11 0 a7.5 7.5 0 1 1 -15 0\"/>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "cafe", "dorado"] },
  { base: "cupcake", nombre: "Cupcake de crema {color}", genero: 'm', precio: 15, descripcion: "Para celebrar.",
    dibujo: "<path fill=\"{D}\" d=\"M10 142 H34 L31 160 H13 Z\"/><path fill=\"none\" stroke=\"{C}\" stroke-width=\"1.4\" d=\"M15 143 L16 159 M20 143 L20 159 M24 143 L24 159 M29 143 L28 159\"/><path fill=\"{L}\" d=\"M8 143 Q6 134 14 133 Q14 124 22 124 Q30 124 30 133 Q38 134 36 143 Z\"/><circle fill=\"#dc2626\" cx=\"22\" cy=\"122\" r=\"3.4\"/>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "dorado"] },
  { base: "dona", nombre: "Dona glaseada {color}", genero: 'f', precio: 15, descripcion: "Con chispitas.",
    dibujo: "<path fill=\"#f59e0b\" fill-rule=\"evenodd\" d=\"M8 142 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 Z M17.5 142 a4.5 4.5 0 1 0 9 0 a4.5 4.5 0 1 0 -9 0 Z\"/><path fill=\"{C}\" fill-rule=\"evenodd\" d=\"M10 141 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0 Z M16.5 142 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 Z\"/><path fill=\"none\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke=\"#fff\" d=\"M14 135 l2 1.5 M28 133 l-1 2 M31 144 l-2 1 M13 147 l2 -1\"/>",
    colores: ["rojo", "naranja", "amarillo", "menta", "azul", "indigo", "morado", "cafe", "blanco", "dorado"] },
  { base: "celular", nombre: "Celular con carcasa {color}", genero: 'm', precio: 20, descripcion: "Para practicar desde cualquier lado.",
    dibujo: "<g transform=\"rotate(-14 24 142)\"><rect fill=\"{C}\" x=\"12\" y=\"121\" width=\"24\" height=\"40\" rx=\"5\"/><rect fill=\"#111827\" x=\"15\" y=\"125\" width=\"18\" height=\"31\" rx=\"2\"/><rect fill=\"#818cf8\" x=\"16.5\" y=\"127\" width=\"15\" height=\"27\" rx=\"1.5\"/><path fill=\"#fff\" d=\"M24 147 c-6 -4 -5 -9 -2 -9 c1 0 2 1 2 2 c0 -1 1 -2 2 -2 c3 0 4 5 -2 9 Z\"/></g>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "morado", "rosa", "cafe", "dorado"] },
  { base: "cuaderno", nombre: "Cuaderno {color}", genero: 'm', precio: 5, descripcion: "Apuntes al día.",
    dibujo: "<g transform=\"rotate(-8 22 140)\"><rect fill=\"{C}\" x=\"8\" y=\"120\" width=\"28\" height=\"38\" rx=\"3\"/><rect fill=\"#fff\" x=\"14\" y=\"128\" width=\"18\" height=\"8\" rx=\"1.5\"/><path fill=\"none\" stroke=\"{L}\" stroke-width=\"1.4\" d=\"M16 132 H30\"/><path fill=\"none\" stroke=\"#94a3b8\" stroke-width=\"2\" d=\"M6 125 h5 M6 133 h5 M6 141 h5 M6 149 h5\"/></g>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "morado", "rosa", "cafe", "negro"] },
  { base: "taza", nombre: "Taza {color}", genero: 'f', precio: 10, descripcion: "Con chocolatico caliente.",
    dibujo: "<path fill=\"none\" stroke=\"#cbd5e1\" stroke-width=\"2\" stroke-linecap=\"round\" d=\"M16 124 q-3 -5 0 -9 M24 124 q-3 -5 0 -9\"/><path fill=\"none\" stroke=\"{C}\" stroke-width=\"3.4\" d=\"M32 136 q8 0 8 7 q0 7 -8 7\"/><rect fill=\"{C}\" x=\"8\" y=\"128\" width=\"26\" height=\"30\" rx=\"4\"/><path fill=\"none\" stroke=\"{L}\" stroke-width=\"2\" d=\"M12 136 H30\"/><text x=\"21\" y=\"152\" text-anchor=\"middle\" fill=\"{L}\" font-family=\"Georgia, serif\" font-style=\"italic\" font-weight=\"700\" font-size=\"11\">∫</text>",
    colores: ["rojo", "naranja", "amarillo", "verde", "azul", "indigo", "morado", "rosa", "cafe", "negro"] },
  { base: "tulipan", nombre: "Tulipán {color}", genero: 'm', precio: 10, descripcion: "Una flor para el profe.",
    dibujo: "<path fill=\"none\" stroke=\"#16a34a\" stroke-width=\"3\" stroke-linecap=\"round\" d=\"M26 160 Q24 140 22 124\"/><path fill=\"#22c55e\" d=\"M24 148 Q34 140 38 146 Q30 152 24 148 Z\"/><path fill=\"{C}\" d=\"M12 112 Q12 126 22 128 Q32 126 32 112 L27 118 L22 108 L17 118 Z\"/><path fill=\"{D}\" opacity=\".35\" d=\"M22 108 L27 118 L32 112 Q32 126 22 128 Z\"/>",
    colores: ["rojo", "naranja", "amarillo", "menta", "azul", "indigo", "morado", "rosa", "blanco", "dorado"] },
  { base: "jugo", nombre: "Cajita de jugo de {color}", genero: 'f', precio: 5, descripcion: "Bien frío.",
    dibujo: "<path fill=\"none\" stroke=\"#f472b6\" stroke-width=\"2.4\" stroke-linecap=\"round\" d=\"M30 128 V118 L36 112\"/><rect fill=\"{C}\" x=\"10\" y=\"128\" width=\"24\" height=\"32\" rx=\"2\"/><path fill=\"{L}\" d=\"M10 128 L14 124 H38 L34 128 Z M34 128 L38 124 V156 L34 160 Z\"/><circle fill=\"{D}\" cx=\"22\" cy=\"146\" r=\"6\"/>",
    colores: [["naranja", "naranja", "#fb923c", "#c2410c", "#fed7aa"], ["mango", "mango", "#fbbf24", "#b45309", "#fef3c7"], ["mora", "mora", "#7e22ce", "#4c1d95", "#d8b4fe"], ["fresa", "fresa", "#f43f5e", "#9f1239", "#fecdd3"], ["manzana", "manzana", "#84cc16", "#3f6212", "#ecfccb"], ["uva", "uva", "#9333ea", "#581c87", "#e9d5ff"], ["lulo", "lulo", "#eab308", "#713f12", "#fef9c3"], ["maracuya", "maracuyá", "#f59e0b", "#78350f", "#fde68a"]] },
  { base: "pelota", nombre: "Pelota {color}", genero: 'f', precio: 15, descripcion: "Para el recreo.",
    dibujo: "<circle fill=\"{C}\" stroke=\"{D}\" stroke-width=\"1.4\" cx=\"22\" cy=\"144\" r=\"14\"/><path fill=\"none\" stroke=\"{L}\" stroke-width=\"3.4\" d=\"M9 138 Q22 146 35 138\"/><path fill=\"none\" stroke=\"rgba(255,255,255,.6)\" stroke-width=\"2.4\" stroke-linecap=\"round\" d=\"M14 136 Q16 132 20 131\"/>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "dorado"] },
  { base: "lapiz", nombre: "Lápiz de color {color}", genero: 'm', precio: 5, descripcion: "Para colorear las gráficas.",
    dibujo: "<g transform=\"rotate(-30 22 140)\"><rect fill=\"{C}\" x=\"17\" y=\"112\" width=\"10\" height=\"36\" rx=\"1.5\"/><path fill=\"none\" stroke=\"{D}\" stroke-width=\"1\" d=\"M20.3 113 V147 M23.7 113 V147\"/><path fill=\"#fcd9a0\" d=\"M17 148 H27 L22 160 Z\"/><path fill=\"{C}\" d=\"M20 155.2 H24 L22 160 Z\"/></g>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "cafe"] },
];
const ESPALDA: Familia[] = [
  { base: "mariposa", nombre: "Alas de mariposa {color}", genero: 'fp', precio: 100, descripcion: "Transformación total.",
    dibujo: "<ellipse fill=\"{C}\" stroke=\"{D}\" stroke-width=\"1.2\" cx=\"20\" cy=\"102\" rx=\"19\" ry=\"14\" transform=\"rotate(-25 20 102)\"/><ellipse fill=\"{L}\" stroke=\"{D}\" stroke-width=\"1.2\" cx=\"22\" cy=\"132\" rx=\"13\" ry=\"10\" transform=\"rotate(20 22 132)\"/><g fill=\"#fff\" opacity=\".8\"><circle cx=\"16\" cy=\"100\" r=\"3.4\"/><circle cx=\"20\" cy=\"132\" r=\"2.4\"/></g><g transform=\"matrix(-1 0 0 1 160 0)\"><ellipse fill=\"{C}\" stroke=\"{D}\" stroke-width=\"1.2\" cx=\"20\" cy=\"102\" rx=\"19\" ry=\"14\" transform=\"rotate(-25 20 102)\"/><ellipse fill=\"{L}\" stroke=\"{D}\" stroke-width=\"1.2\" cx=\"22\" cy=\"132\" rx=\"13\" ry=\"10\" transform=\"rotate(20 22 132)\"/><g fill=\"#fff\" opacity=\".8\"><circle cx=\"16\" cy=\"100\" r=\"3.4\"/><circle cx=\"20\" cy=\"132\" r=\"2.4\"/></g></g>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "dorado"] },
  { base: "capa", nombre: "Capa {color}", genero: 'f', precio: 60, descripcion: "Para salvar el semestre.",
    dibujo: "<path fill=\"{C}\" d=\"M44 96 Q16 140 22 178 Q80 170 138 178 Q144 140 116 96 Z\"/><path fill=\"none\" stroke=\"{D}\" stroke-width=\"1.4\" d=\"M34 130 Q28 156 30 174 M126 130 Q132 156 130 174\"/>",
    colores: ["naranja", "amarillo", "verde", "azul", "indigo", "morado", "rosa", "cafe", "negro", "dorado"] },
  { base: "mochila", nombre: "Mochila {color}", genero: 'f', precio: 10, descripcion: "Con todos los cuadernos.",
    dibujo: "<rect fill=\"{C}\" x=\"24\" y=\"100\" width=\"112\" height=\"62\" rx=\"16\"/><rect fill=\"{D}\" x=\"18\" y=\"128\" width=\"12\" height=\"26\" rx=\"5\"/><rect fill=\"{D}\" x=\"130\" y=\"128\" width=\"12\" height=\"26\" rx=\"5\"/>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "indigo", "morado", "rosa", "cafe", "negro"] },
  { base: "hada", nombre: "Alas de hada {color}", genero: 'fp', precio: 160, descripcion: "Polvo de estrellas.",
    dibujo: "<path fill=\"{L}\" fill-opacity=\".8\" stroke=\"{C}\" stroke-width=\"1.4\" d=\"M46 112 Q20 70 2 78 Q8 100 30 116 Q6 126 12 146 Q30 146 46 126 Z\"/><path fill=\"none\" stroke=\"{C}\" stroke-width=\"1\" d=\"M44 114 Q24 92 8 82 M44 122 Q26 132 14 142\"/><g transform=\"matrix(-1 0 0 1 160 0)\"><path fill=\"{L}\" fill-opacity=\".8\" stroke=\"{C}\" stroke-width=\"1.4\" d=\"M46 112 Q20 70 2 78 Q8 100 30 116 Q6 126 12 146 Q30 146 46 126 Z\"/><path fill=\"none\" stroke=\"{C}\" stroke-width=\"1\" d=\"M44 114 Q24 92 8 82 M44 122 Q26 132 14 142\"/></g>",
    colores: ["rosa", "azul", "verde", "dorado", "menta", "naranja", "rojo", "blanco"] },
  { base: "colagato", nombre: "Cola de gato {color}", genero: 'f', precio: 50, descripcion: "Elegante y curiosa.",
    dibujo: "<path fill=\"none\" stroke=\"{C}\" stroke-width=\"7\" stroke-linecap=\"round\" d=\"M114 160 Q150 162 146 130 Q144 112 154 104\"/>",
    colores: ["naranja", "blanco", "cafe", "dorado", "morado", "rosa"] },
  { base: "jetpack", nombre: "Jetpack {color}", genero: 'm', precio: 260, descripcion: "Despegue inmediato.",
    dibujo: "<path fill=\"#f97316\" d=\"M10 160 Q18 184 26 160 Q18 168 10 160 Z\"/><path fill=\"#fde047\" d=\"M13 160 Q18 175 23 160 Z\"/><rect fill=\"{C}\" stroke=\"{D}\" stroke-width=\"1.4\" x=\"6\" y=\"108\" width=\"24\" height=\"52\" rx=\"11\"/><rect fill=\"{L}\" x=\"6\" y=\"120\" width=\"24\" height=\"5\"/><path fill=\"none\" stroke=\"{D}\" stroke-width=\"3\" d=\"M30 128 H40\"/><g transform=\"matrix(-1 0 0 1 160 0)\"><path fill=\"#f97316\" d=\"M10 160 Q18 184 26 160 Q18 168 10 160 Z\"/><path fill=\"#fde047\" d=\"M13 160 Q18 175 23 160 Z\"/><rect fill=\"{C}\" stroke=\"{D}\" stroke-width=\"1.4\" x=\"6\" y=\"108\" width=\"24\" height=\"52\" rx=\"11\"/><rect fill=\"{L}\" x=\"6\" y=\"120\" width=\"24\" height=\"5\"/><path fill=\"none\" stroke=\"{D}\" stroke-width=\"3\" d=\"M30 128 H40\"/></g>",
    colores: ["rojo", "azul", "verde", "dorado", "morado", "negro"] },
];
const FONDO: Familia[] = [
  { base: "lunares", nombre: "Lunares {color}", genero: 'mp', precio: 10, descripcion: "Clásico y tierno.",
    dibujo: "<rect width=\"160\" height=\"190\" fill=\"{L}\"/><g fill=\"{C}\" opacity=\".55\"><circle cx=\"7\" cy=\"20\" r=\"3.4\"/><circle cx=\"0\" cy=\"34\" r=\"3.4\"/><circle cx=\"7\" cy=\"48\" r=\"3.4\"/><circle cx=\"0\" cy=\"62\" r=\"3.4\"/><circle cx=\"7\" cy=\"76\" r=\"3.4\"/><circle cx=\"0\" cy=\"90\" r=\"3.4\"/><circle cx=\"7\" cy=\"104\" r=\"3.4\"/><circle cx=\"0\" cy=\"118\" r=\"3.4\"/><circle cx=\"7\" cy=\"132\" r=\"3.4\"/><circle cx=\"0\" cy=\"146\" r=\"3.4\"/><circle cx=\"7\" cy=\"160\" r=\"3.4\"/><circle cx=\"0\" cy=\"174\" r=\"3.4\"/><circle cx=\"7\" cy=\"188\" r=\"3.4\"/><circle cx=\"21\" cy=\"20\" r=\"3.4\"/><circle cx=\"14\" cy=\"34\" r=\"3.4\"/><circle cx=\"21\" cy=\"48\" r=\"3.4\"/><circle cx=\"14\" cy=\"62\" r=\"3.4\"/><circle cx=\"21\" cy=\"76\" r=\"3.4\"/><circle cx=\"14\" cy=\"90\" r=\"3.4\"/><circle cx=\"21\" cy=\"104\" r=\"3.4\"/><circle cx=\"14\" cy=\"118\" r=\"3.4\"/><circle cx=\"21\" cy=\"132\" r=\"3.4\"/><circle cx=\"14\" cy=\"146\" r=\"3.4\"/><circle cx=\"21\" cy=\"160\" r=\"3.4\"/><circle cx=\"14\" cy=\"174\" r=\"3.4\"/><circle cx=\"21\" cy=\"188\" r=\"3.4\"/><circle cx=\"35\" cy=\"20\" r=\"3.4\"/><circle cx=\"28\" cy=\"34\" r=\"3.4\"/><circle cx=\"35\" cy=\"48\" r=\"3.4\"/><circle cx=\"28\" cy=\"62\" r=\"3.4\"/><circle cx=\"35\" cy=\"76\" r=\"3.4\"/><circle cx=\"28\" cy=\"90\" r=\"3.4\"/><circle cx=\"35\" cy=\"104\" r=\"3.4\"/><circle cx=\"28\" cy=\"118\" r=\"3.4\"/><circle cx=\"35\" cy=\"132\" r=\"3.4\"/><circle cx=\"28\" cy=\"146\" r=\"3.4\"/><circle cx=\"35\" cy=\"160\" r=\"3.4\"/><circle cx=\"28\" cy=\"174\" r=\"3.4\"/><circle cx=\"35\" cy=\"188\" r=\"3.4\"/><circle cx=\"49\" cy=\"20\" r=\"3.4\"/><circle cx=\"42\" cy=\"34\" r=\"3.4\"/><circle cx=\"49\" cy=\"48\" r=\"3.4\"/><circle cx=\"42\" cy=\"62\" r=\"3.4\"/><circle cx=\"49\" cy=\"76\" r=\"3.4\"/><circle cx=\"42\" cy=\"90\" r=\"3.4\"/><circle cx=\"49\" cy=\"104\" r=\"3.4\"/><circle cx=\"42\" cy=\"118\" r=\"3.4\"/><circle cx=\"49\" cy=\"132\" r=\"3.4\"/><circle cx=\"42\" cy=\"146\" r=\"3.4\"/><circle cx=\"49\" cy=\"160\" r=\"3.4\"/><circle cx=\"42\" cy=\"174\" r=\"3.4\"/><circle cx=\"49\" cy=\"188\" r=\"3.4\"/><circle cx=\"63\" cy=\"20\" r=\"3.4\"/><circle cx=\"56\" cy=\"34\" r=\"3.4\"/><circle cx=\"63\" cy=\"48\" r=\"3.4\"/><circle cx=\"56\" cy=\"62\" r=\"3.4\"/><circle cx=\"63\" cy=\"76\" r=\"3.4\"/><circle cx=\"56\" cy=\"90\" r=\"3.4\"/><circle cx=\"63\" cy=\"104\" r=\"3.4\"/><circle cx=\"56\" cy=\"118\" r=\"3.4\"/><circle cx=\"63\" cy=\"132\" r=\"3.4\"/><circle cx=\"56\" cy=\"146\" r=\"3.4\"/><circle cx=\"63\" cy=\"160\" r=\"3.4\"/><circle cx=\"56\" cy=\"174\" r=\"3.4\"/><circle cx=\"63\" cy=\"188\" r=\"3.4\"/><circle cx=\"77\" cy=\"20\" r=\"3.4\"/><circle cx=\"70\" cy=\"34\" r=\"3.4\"/><circle cx=\"77\" cy=\"48\" r=\"3.4\"/><circle cx=\"70\" cy=\"62\" r=\"3.4\"/><circle cx=\"77\" cy=\"76\" r=\"3.4\"/><circle cx=\"70\" cy=\"90\" r=\"3.4\"/><circle cx=\"77\" cy=\"104\" r=\"3.4\"/><circle cx=\"70\" cy=\"118\" r=\"3.4\"/><circle cx=\"77\" cy=\"132\" r=\"3.4\"/><circle cx=\"70\" cy=\"146\" r=\"3.4\"/><circle cx=\"77\" cy=\"160\" r=\"3.4\"/><circle cx=\"70\" cy=\"174\" r=\"3.4\"/><circle cx=\"77\" cy=\"188\" r=\"3.4\"/><circle cx=\"91\" cy=\"20\" r=\"3.4\"/><circle cx=\"84\" cy=\"34\" r=\"3.4\"/><circle cx=\"91\" cy=\"48\" r=\"3.4\"/><circle cx=\"84\" cy=\"62\" r=\"3.4\"/><circle cx=\"91\" cy=\"76\" r=\"3.4\"/><circle cx=\"84\" cy=\"90\" r=\"3.4\"/><circle cx=\"91\" cy=\"104\" r=\"3.4\"/><circle cx=\"84\" cy=\"118\" r=\"3.4\"/><circle cx=\"91\" cy=\"132\" r=\"3.4\"/><circle cx=\"84\" cy=\"146\" r=\"3.4\"/><circle cx=\"91\" cy=\"160\" r=\"3.4\"/><circle cx=\"84\" cy=\"174\" r=\"3.4\"/><circle cx=\"91\" cy=\"188\" r=\"3.4\"/><circle cx=\"105\" cy=\"20\" r=\"3.4\"/><circle cx=\"98\" cy=\"34\" r=\"3.4\"/><circle cx=\"105\" cy=\"48\" r=\"3.4\"/><circle cx=\"98\" cy=\"62\" r=\"3.4\"/><circle cx=\"105\" cy=\"76\" r=\"3.4\"/><circle cx=\"98\" cy=\"90\" r=\"3.4\"/><circle cx=\"105\" cy=\"104\" r=\"3.4\"/><circle cx=\"98\" cy=\"118\" r=\"3.4\"/><circle cx=\"105\" cy=\"132\" r=\"3.4\"/><circle cx=\"98\" cy=\"146\" r=\"3.4\"/><circle cx=\"105\" cy=\"160\" r=\"3.4\"/><circle cx=\"98\" cy=\"174\" r=\"3.4\"/><circle cx=\"105\" cy=\"188\" r=\"3.4\"/><circle cx=\"119\" cy=\"20\" r=\"3.4\"/><circle cx=\"112\" cy=\"34\" r=\"3.4\"/><circle cx=\"119\" cy=\"48\" r=\"3.4\"/><circle cx=\"112\" cy=\"62\" r=\"3.4\"/><circle cx=\"119\" cy=\"76\" r=\"3.4\"/><circle cx=\"112\" cy=\"90\" r=\"3.4\"/><circle cx=\"119\" cy=\"104\" r=\"3.4\"/><circle cx=\"112\" cy=\"118\" r=\"3.4\"/><circle cx=\"119\" cy=\"132\" r=\"3.4\"/><circle cx=\"112\" cy=\"146\" r=\"3.4\"/><circle cx=\"119\" cy=\"160\" r=\"3.4\"/><circle cx=\"112\" cy=\"174\" r=\"3.4\"/><circle cx=\"119\" cy=\"188\" r=\"3.4\"/><circle cx=\"133\" cy=\"20\" r=\"3.4\"/><circle cx=\"126\" cy=\"34\" r=\"3.4\"/><circle cx=\"133\" cy=\"48\" r=\"3.4\"/><circle cx=\"126\" cy=\"62\" r=\"3.4\"/><circle cx=\"133\" cy=\"76\" r=\"3.4\"/><circle cx=\"126\" cy=\"90\" r=\"3.4\"/><circle cx=\"133\" cy=\"104\" r=\"3.4\"/><circle cx=\"126\" cy=\"118\" r=\"3.4\"/><circle cx=\"133\" cy=\"132\" r=\"3.4\"/><circle cx=\"126\" cy=\"146\" r=\"3.4\"/><circle cx=\"133\" cy=\"160\" r=\"3.4\"/><circle cx=\"126\" cy=\"174\" r=\"3.4\"/><circle cx=\"133\" cy=\"188\" r=\"3.4\"/><circle cx=\"147\" cy=\"20\" r=\"3.4\"/><circle cx=\"140\" cy=\"34\" r=\"3.4\"/><circle cx=\"147\" cy=\"48\" r=\"3.4\"/><circle cx=\"140\" cy=\"62\" r=\"3.4\"/><circle cx=\"147\" cy=\"76\" r=\"3.4\"/><circle cx=\"140\" cy=\"90\" r=\"3.4\"/><circle cx=\"147\" cy=\"104\" r=\"3.4\"/><circle cx=\"140\" cy=\"118\" r=\"3.4\"/><circle cx=\"147\" cy=\"132\" r=\"3.4\"/><circle cx=\"140\" cy=\"146\" r=\"3.4\"/><circle cx=\"147\" cy=\"160\" r=\"3.4\"/><circle cx=\"140\" cy=\"174\" r=\"3.4\"/><circle cx=\"147\" cy=\"188\" r=\"3.4\"/><circle cx=\"161\" cy=\"20\" r=\"3.4\"/><circle cx=\"154\" cy=\"34\" r=\"3.4\"/><circle cx=\"161\" cy=\"48\" r=\"3.4\"/><circle cx=\"154\" cy=\"62\" r=\"3.4\"/><circle cx=\"161\" cy=\"76\" r=\"3.4\"/><circle cx=\"154\" cy=\"90\" r=\"3.4\"/><circle cx=\"161\" cy=\"104\" r=\"3.4\"/><circle cx=\"154\" cy=\"118\" r=\"3.4\"/><circle cx=\"161\" cy=\"132\" r=\"3.4\"/><circle cx=\"154\" cy=\"146\" r=\"3.4\"/><circle cx=\"161\" cy=\"160\" r=\"3.4\"/><circle cx=\"154\" cy=\"174\" r=\"3.4\"/><circle cx=\"161\" cy=\"188\" r=\"3.4\"/><circle cx=\"175\" cy=\"20\" r=\"3.4\"/><circle cx=\"168\" cy=\"34\" r=\"3.4\"/><circle cx=\"175\" cy=\"48\" r=\"3.4\"/><circle cx=\"168\" cy=\"62\" r=\"3.4\"/><circle cx=\"175\" cy=\"76\" r=\"3.4\"/><circle cx=\"168\" cy=\"90\" r=\"3.4\"/><circle cx=\"175\" cy=\"104\" r=\"3.4\"/><circle cx=\"168\" cy=\"118\" r=\"3.4\"/><circle cx=\"175\" cy=\"132\" r=\"3.4\"/><circle cx=\"168\" cy=\"146\" r=\"3.4\"/><circle cx=\"175\" cy=\"160\" r=\"3.4\"/><circle cx=\"168\" cy=\"174\" r=\"3.4\"/><circle cx=\"175\" cy=\"188\" r=\"3.4\"/></g>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "cafe"] },
  { base: "rayas", nombre: "Rayas {color}", genero: 'fp', precio: 10, descripcion: "Con mucho ritmo.",
    dibujo: "<rect width=\"160\" height=\"190\" fill=\"{L}\"/><g stroke=\"{C}\" stroke-width=\"7\" opacity=\".6\"><path d=\"M0 0 L-120 190\"/><path d=\"M18 0 L-102 190\"/><path d=\"M36 0 L-84 190\"/><path d=\"M54 0 L-66 190\"/><path d=\"M72 0 L-48 190\"/><path d=\"M90 0 L-30 190\"/><path d=\"M108 0 L-12 190\"/><path d=\"M126 0 L6 190\"/><path d=\"M144 0 L24 190\"/><path d=\"M162 0 L42 190\"/><path d=\"M180 0 L60 190\"/><path d=\"M198 0 L78 190\"/><path d=\"M216 0 L96 190\"/><path d=\"M234 0 L114 190\"/><path d=\"M252 0 L132 190\"/><path d=\"M270 0 L150 190\"/><path d=\"M288 0 L168 190\"/></g>",
    colores: ["rojo", "naranja", "verde", "menta", "azul", "indigo", "morado", "rosa", "cafe", "dorado"] },
  { base: "cuadros", nombre: "Cuadros {color}", genero: 'mp', precio: 15, descripcion: "Como un mantel de picnic.",
    dibujo: "<rect width=\"160\" height=\"190\" fill=\"#fff\"/><g fill=\"{C}\" opacity=\".3\"><rect x=\"0\" y=\"0\" width=\"10\" height=\"190\"/><rect x=\"20\" y=\"0\" width=\"10\" height=\"190\"/><rect x=\"40\" y=\"0\" width=\"10\" height=\"190\"/><rect x=\"60\" y=\"0\" width=\"10\" height=\"190\"/><rect x=\"80\" y=\"0\" width=\"10\" height=\"190\"/><rect x=\"100\" y=\"0\" width=\"10\" height=\"190\"/><rect x=\"120\" y=\"0\" width=\"10\" height=\"190\"/><rect x=\"140\" y=\"0\" width=\"10\" height=\"190\"/><rect x=\"160\" y=\"0\" width=\"10\" height=\"190\"/><rect x=\"0\" y=\"0\" width=\"170\" height=\"10\"/><rect x=\"0\" y=\"20\" width=\"170\" height=\"10\"/><rect x=\"0\" y=\"40\" width=\"170\" height=\"10\"/><rect x=\"0\" y=\"60\" width=\"170\" height=\"10\"/><rect x=\"0\" y=\"80\" width=\"170\" height=\"10\"/><rect x=\"0\" y=\"100\" width=\"170\" height=\"10\"/><rect x=\"0\" y=\"120\" width=\"170\" height=\"10\"/><rect x=\"0\" y=\"140\" width=\"170\" height=\"10\"/><rect x=\"0\" y=\"160\" width=\"170\" height=\"10\"/><rect x=\"0\" y=\"180\" width=\"170\" height=\"10\"/></g>",
    colores: ["rojo", "naranja", "amarillo", "verde", "menta", "azul", "indigo", "morado", "rosa", "cafe"] },
  { base: "corazones", nombre: "Corazones {color}", genero: 'mp', precio: 15, descripcion: "Mucho amor por aprender.",
    dibujo: "<rect width=\"160\" height=\"190\" fill=\"{L}\"/><g fill=\"{C}\" opacity=\".7\"><path transform=\"translate(73 110) scale(1.5)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(75 102) scale(1.3)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(35 103) scale(1.3)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(122 40) scale(1.0)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(21 147) scale(1.4)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(14 173) scale(1.6)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(102 118) scale(0.9)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(10 105) scale(0.8)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(35 62) scale(0.8)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(75 92) scale(1.5)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(83 122) scale(1.2)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(103 95) scale(1.0)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(152 175) scale(1.5)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(110 73) scale(1.0)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(50 37) scale(1.4)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(66 153) scale(1.1)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(146 153) scale(0.8)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(38 163) scale(1.2)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(149 86) scale(0.9)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(99 143) scale(1.0)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(21 76) scale(1.6)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/><path transform=\"translate(117 44) scale(1.0)\" d=\"M0 6 C-8 1 -7 -6 -3.5 -6 C-1.6 -6 0 -4.6 0 -3.2 C0 -4.6 1.6 -6 3.5 -6 C7 -6 8 1 0 6 Z\"/></g>",
    colores: ["rojo", "morado", "azul", "verde", "naranja"] },
  { base: "cielo", nombre: "Cielo {color}", genero: 'm', precio: 40, descripcion: "Un cielo para cada momento.",
    dibujo: "<rect width=\"160\" height=\"190\" fill=\"{C}\"/><rect width=\"160\" height=\"70\" fill=\"{D}\" opacity=\".45\"/><circle cx=\"128\" cy=\"44\" r=\"14\" fill=\"{L}\"/><g fill=\"#fff\" opacity=\".85\"><circle cx=\"30\" cy=\"50\" r=\"8\"/><circle cx=\"40\" cy=\"45\" r=\"10\"/><circle cx=\"51\" cy=\"50\" r=\"8\"/><rect x=\"22\" y=\"50\" width=\"37\" height=\"8\" rx=\"4\"/><circle cx=\"112\" cy=\"72\" r=\"7\"/><circle cx=\"121\" cy=\"68\" r=\"9\"/><circle cx=\"130\" cy=\"72\" r=\"7\"/><rect x=\"105\" y=\"72\" width=\"32\" height=\"7\" rx=\"3.5\"/></g><rect y=\"150\" width=\"160\" height=\"40\" fill=\"#4d7c0f\" opacity=\".85\"/>",
    colores: [["amanecer", "al amanecer", "#fdba74", "#f472b6", "#fef08a"], ["mediodia", "de mediodía", "#7dd3fc", "#38bdf8", "#fde047"], ["ocaso", "al ocaso", "#fb923c", "#9333ea", "#fde047"], ["crepusculo", "de crepúsculo", "#818cf8", "#312e81", "#fde68a"], ["tormenta", "de tormenta", "#94a3b8", "#334155", "#e2e8f0"]] },
  { base: "noche", nombre: "Noche {color}", genero: 'f', precio: 60, descripcion: "Estrellas para estudiar tarde.",
    dibujo: "<rect width=\"160\" height=\"190\" fill=\"{D}\"/><g fill=\"{L}\"><circle cx=\"19\" cy=\"29\" r=\"1.6\"/><circle cx=\"31\" cy=\"104\" r=\"1.6\"/><circle cx=\"81\" cy=\"168\" r=\"1\"/><circle cx=\"68\" cy=\"78\" r=\"1.6\"/><circle cx=\"68\" cy=\"52\" r=\"1.3\"/><circle cx=\"135\" cy=\"166\" r=\"1.3\"/><circle cx=\"156\" cy=\"23\" r=\"1\"/><circle cx=\"64\" cy=\"148\" r=\"0.8\"/><circle cx=\"10\" cy=\"42\" r=\"1.6\"/><circle cx=\"43\" cy=\"136\" r=\"1.3\"/><circle cx=\"130\" cy=\"78\" r=\"0.8\"/><circle cx=\"18\" cy=\"107\" r=\"1\"/><circle cx=\"6\" cy=\"75\" r=\"1.6\"/><circle cx=\"23\" cy=\"108\" r=\"1\"/><circle cx=\"136\" cy=\"47\" r=\"1\"/><circle cx=\"51\" cy=\"54\" r=\"1\"/><circle cx=\"114\" cy=\"44\" r=\"1\"/><circle cx=\"108\" cy=\"78\" r=\"1.6\"/><circle cx=\"96\" cy=\"83\" r=\"0.8\"/><circle cx=\"21\" cy=\"97\" r=\"1.3\"/><circle cx=\"40\" cy=\"126\" r=\"1.3\"/><circle cx=\"68\" cy=\"156\" r=\"1.6\"/><circle cx=\"49\" cy=\"46\" r=\"0.8\"/><circle cx=\"23\" cy=\"92\" r=\"0.8\"/><circle cx=\"47\" cy=\"158\" r=\"1\"/><circle cx=\"118\" cy=\"30\" r=\"1.6\"/><circle cx=\"72\" cy=\"29\" r=\"1\"/><circle cx=\"47\" cy=\"100\" r=\"1\"/><circle cx=\"18\" cy=\"41\" r=\"1.6\"/><circle cx=\"153\" cy=\"119\" r=\"1\"/><circle cx=\"94\" cy=\"159\" r=\"1.6\"/><circle cx=\"142\" cy=\"125\" r=\"0.8\"/><circle cx=\"7\" cy=\"115\" r=\"1.6\"/><circle cx=\"14\" cy=\"67\" r=\"1\"/><circle cx=\"156\" cy=\"31\" r=\"1.3\"/><circle cx=\"116\" cy=\"155\" r=\"1\"/><circle cx=\"125\" cy=\"157\" r=\"1.3\"/><circle cx=\"17\" cy=\"91\" r=\"0.8\"/><circle cx=\"136\" cy=\"83\" r=\"0.8\"/><circle cx=\"135\" cy=\"106\" r=\"1.6\"/><circle cx=\"62\" cy=\"22\" r=\"0.8\"/><circle cx=\"16\" cy=\"116\" r=\"1.3\"/><circle cx=\"138\" cy=\"129\" r=\"1.6\"/><circle cx=\"146\" cy=\"124\" r=\"1.6\"/><circle cx=\"71\" cy=\"146\" r=\"0.8\"/></g><path fill=\"{C}\" opacity=\".5\" d=\"M0 150 Q40 136 80 146 Q120 134 160 148 V190 H0 Z\"/>",
    colores: ["azul", "morado", "indigo", "verde", "rosa"] },
  { base: "confeti", nombre: "Confeti {color}", genero: 'm', precio: 35, descripcion: "¡Fiesta!",
    dibujo: "<rect width=\"160\" height=\"190\" fill=\"{L}\"/><rect x=\"81\" y=\"101\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#22c55e\" transform=\"rotate(153 81 101)\"/><rect x=\"17\" y=\"25\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#f97316\" transform=\"rotate(28 17 25)\"/><rect x=\"78\" y=\"117\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#facc15\" transform=\"rotate(65 78 117)\"/><rect x=\"137\" y=\"79\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#3b82f6\" transform=\"rotate(173 137 79)\"/><rect x=\"95\" y=\"102\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ec4899\" transform=\"rotate(87 95 102)\"/><rect x=\"102\" y=\"90\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#3b82f6\" transform=\"rotate(83 102 90)\"/><rect x=\"64\" y=\"61\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#f97316\" transform=\"rotate(110 64 61)\"/><rect x=\"123\" y=\"138\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#3b82f6\" transform=\"rotate(54 123 138)\"/><rect x=\"61\" y=\"112\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#22c55e\" transform=\"rotate(53 61 112)\"/><rect x=\"24\" y=\"98\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ec4899\" transform=\"rotate(10 24 98)\"/><rect x=\"109\" y=\"168\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#22c55e\" transform=\"rotate(43 109 168)\"/><rect x=\"21\" y=\"95\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#3b82f6\" transform=\"rotate(105 21 95)\"/><rect x=\"61\" y=\"102\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#f97316\" transform=\"rotate(80 61 102)\"/><rect x=\"110\" y=\"152\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#a855f7\" transform=\"rotate(115 110 152)\"/><rect x=\"51\" y=\"150\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#22c55e\" transform=\"rotate(155 51 150)\"/><rect x=\"10\" y=\"131\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#a855f7\" transform=\"rotate(90 10 131)\"/><rect x=\"50\" y=\"144\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ef4444\" transform=\"rotate(164 50 144)\"/><rect x=\"24\" y=\"92\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ef4444\" transform=\"rotate(68 24 92)\"/><rect x=\"39\" y=\"44\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ef4444\" transform=\"rotate(161 39 44)\"/><rect x=\"21\" y=\"39\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#a855f7\" transform=\"rotate(167 21 39)\"/><rect x=\"99\" y=\"79\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ef4444\" transform=\"rotate(175 99 79)\"/><rect x=\"33\" y=\"149\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#22c55e\" transform=\"rotate(45 33 149)\"/><rect x=\"110\" y=\"138\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#a855f7\" transform=\"rotate(9 110 138)\"/><rect x=\"31\" y=\"64\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#22c55e\" transform=\"rotate(138 31 64)\"/><rect x=\"107\" y=\"102\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#a855f7\" transform=\"rotate(40 107 102)\"/><rect x=\"62\" y=\"144\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#3b82f6\" transform=\"rotate(22 62 144)\"/><rect x=\"65\" y=\"159\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#facc15\" transform=\"rotate(33 65 159)\"/><rect x=\"71\" y=\"52\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ef4444\" transform=\"rotate(96 71 52)\"/><rect x=\"85\" y=\"123\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#a855f7\" transform=\"rotate(87 85 123)\"/><rect x=\"73\" y=\"122\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#3b82f6\" transform=\"rotate(25 73 122)\"/><rect x=\"111\" y=\"148\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#f97316\" transform=\"rotate(31 111 148)\"/><rect x=\"36\" y=\"161\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ef4444\" transform=\"rotate(79 36 161)\"/><rect x=\"83\" y=\"144\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#22c55e\" transform=\"rotate(67 83 144)\"/><rect x=\"139\" y=\"154\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#22c55e\" transform=\"rotate(129 139 154)\"/><rect x=\"16\" y=\"90\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#a855f7\" transform=\"rotate(107 16 90)\"/><rect x=\"118\" y=\"97\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ef4444\" transform=\"rotate(55 118 97)\"/><rect x=\"124\" y=\"32\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ec4899\" transform=\"rotate(8 124 32)\"/><rect x=\"30\" y=\"74\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#ec4899\" transform=\"rotate(35 30 74)\"/><rect x=\"74\" y=\"176\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#f97316\" transform=\"rotate(132 74 176)\"/><rect x=\"128\" y=\"128\" width=\"4\" height=\"7\" rx=\"1\" fill=\"#facc15\" transform=\"rotate(148 128 128)\"/>",
    colores: ["amarillo", "rosa", "azul", "verde", "morado"] },
];
const GENERO: Record<Genero, number> = { m: 1, f: 2, mp: 3, fp: 4 };

function pintar(plantilla: string, principal: string, oscuro: string, claro: string): string {
  return plantilla.replaceAll('{C}', principal).replaceAll('{D}', oscuro).replaceAll('{L}', claro);
}

export function expandir(f: Familia): Variante[] {
  return f.colores.map(c => {
    const p = typeof c === 'string' ? PALETA.find(x => x[0] === c)! : null;
    const [id, nombreColor, principal, oscuro, claro, recargo] = p
      ? [p[0], p[GENERO[f.genero]] as string, p[5], p[6], p[7], p[8]]
      : [c[0], c[1], c[2], c[3], c[4], 0];
    return {
      id: `${f.base}-${id}`,
      nombre: f.nombre.replace('{color}', nombreColor),
      precio: f.precio + recargo,
      descripcion: f.descripcion,
      dibujo: pintar(f.dibujo, principal, oscuro, claro),
      ...(f.mangas !== undefined ? { mangas: pintar(f.mangas, principal, oscuro, claro) } : {}),
      ...(f.traje ? { traje: true } : {}),
      ...(f.disfraz ? { disfraz: true } : {}),
    };
  });
}

export const VARIANTES = {
  cabeza: CABEZA.flatMap(expandir),
  cara: CARA.flatMap(expandir),
  mano: MANO.flatMap(expandir),
  espalda: ESPALDA.flatMap(expandir),
  fondo: FONDO.flatMap(expandir),
};

/** Las vinchas van en la frente: dejan ver la flor. */
export const VARIANTES_NO_TAPAN_FLOR = ['vincha'];

/** Bufandas: [id, nombre, precio, base, raya, punta, punta de atrás y nudo, color de la integral] */
export const BUFANDAS_VARIANTES: [string, string, number, string, string, string, string, string | null][] = [
  ["azul-cafe", "Azul con raya café", 20, "#3b82f6", "#92400e", "#bfdbfe", "#1d4ed8", null],
  ["menta-dorado", "Menta con raya dorada", 35, "#2dd4bf", "#eab308", "#ccfbf1", "#0f766e", null],
  ["amarillo-morado", "Amarilla con raya morada", 20, "#facc15", "#a855f7", "#fef08a", "#ca8a04", "#1f2937"],
  ["negro-rosa", "Negra con raya rosa", 20, "#1f2937", "#ec4899", "#9ca3af", "#030712", null],
  ["menta-verde", "Menta con raya verde", 20, "#2dd4bf", "#22c55e", "#ccfbf1", "#0f766e", null],
  ["naranja-verde", "Naranja con raya verde", 20, "#f97316", "#22c55e", "#fed7aa", "#c2410c", null],
  ["morado-verde", "Morada con raya verde", 20, "#a855f7", "#22c55e", "#e9d5ff", "#7e22ce", null],
  ["negro-indigo", "Negra con raya índigo", 20, "#1f2937", "#6366f1", "#9ca3af", "#030712", null],
  ["blanco-azul", "Blanca con raya azul", 20, "#f8fafc", "#3b82f6", "#e2e8f0", "#94a3b8", "#1f2937"],
  ["morado-cafe", "Morada con raya café", 20, "#a855f7", "#92400e", "#e9d5ff", "#7e22ce", null],
  ["rosa-blanco", "Rosa con raya blanca", 20, "#ec4899", "#f8fafc", "#fbcfe8", "#be185d", null],
  ["morado-azul", "Morada con raya azul", 20, "#a855f7", "#3b82f6", "#e9d5ff", "#7e22ce", null],
  ["menta-negro", "Menta con raya negra", 20, "#2dd4bf", "#1f2937", "#ccfbf1", "#0f766e", null],
  ["verde-cafe", "Verde con raya café", 20, "#22c55e", "#92400e", "#bbf7d0", "#15803d", null],
  ["amarillo-blanco", "Amarilla con raya blanca", 20, "#facc15", "#f8fafc", "#fef08a", "#ca8a04", "#1f2937"],
  ["blanco-morado", "Blanca con raya morada", 20, "#f8fafc", "#a855f7", "#e2e8f0", "#94a3b8", "#1f2937"],
  ["amarillo-rosa", "Amarilla con raya rosa", 20, "#facc15", "#ec4899", "#fef08a", "#ca8a04", "#1f2937"],
  ["verde-indigo", "Verde con raya índigo", 20, "#22c55e", "#6366f1", "#bbf7d0", "#15803d", null],
  ["negro-morado", "Negra con raya morada", 20, "#1f2937", "#a855f7", "#9ca3af", "#030712", null],
  ["cafe-rosa", "Café con raya rosa", 20, "#92400e", "#ec4899", "#fde68a", "#451a03", null],
  ["verde-dorado", "Verde con raya dorada", 35, "#22c55e", "#eab308", "#bbf7d0", "#15803d", null],
  ["cafe-morado", "Café con raya morada", 20, "#92400e", "#a855f7", "#fde68a", "#451a03", null],
  ["azul-dorado", "Azul con raya dorada", 35, "#3b82f6", "#eab308", "#bfdbfe", "#1d4ed8", null],
  ["indigo-morado", "Índigo con raya morada", 20, "#6366f1", "#a855f7", "#c7d2fe", "#4338ca", null],
  ["azul-amarillo", "Azul con raya amarilla", 20, "#3b82f6", "#facc15", "#bfdbfe", "#1d4ed8", null],
  ["rojo-azul", "Roja con raya azul", 20, "#ef4444", "#3b82f6", "#fecaca", "#b91c1c", null],
  ["menta-rojo", "Menta con raya roja", 20, "#2dd4bf", "#ef4444", "#ccfbf1", "#0f766e", null],
  ["naranja-rosa", "Naranja con raya rosa", 20, "#f97316", "#ec4899", "#fed7aa", "#c2410c", null],
  ["indigo-blanco", "Índigo con raya blanca", 20, "#6366f1", "#f8fafc", "#c7d2fe", "#4338ca", null],
  ["rojo-blanco", "Roja con raya blanca", 20, "#ef4444", "#f8fafc", "#fecaca", "#b91c1c", null],
  ["verde-rojo", "Verde con raya roja", 20, "#22c55e", "#ef4444", "#bbf7d0", "#15803d", null],
  ["rojo-indigo", "Roja con raya índigo", 20, "#ef4444", "#6366f1", "#fecaca", "#b91c1c", null],
  ["rosa-negro", "Rosa con raya negra", 20, "#ec4899", "#1f2937", "#fbcfe8", "#be185d", null],
  ["menta-blanco", "Menta con raya blanca", 20, "#2dd4bf", "#f8fafc", "#ccfbf1", "#0f766e", null],
  ["negro-naranja", "Negra con raya naranja", 20, "#1f2937", "#f97316", "#9ca3af", "#030712", null],
  ["cafe-menta", "Café con raya menta", 20, "#92400e", "#2dd4bf", "#fde68a", "#451a03", null],
  ["rojo-morado", "Roja con raya morada", 20, "#ef4444", "#a855f7", "#fecaca", "#b91c1c", null],
  ["indigo-negro", "Índigo con raya negra", 20, "#6366f1", "#1f2937", "#c7d2fe", "#4338ca", null],
  ["cafe-amarillo", "Café con raya amarilla", 20, "#92400e", "#facc15", "#fde68a", "#451a03", null],
  ["morado-naranja", "Morada con raya naranja", 20, "#a855f7", "#f97316", "#e9d5ff", "#7e22ce", null],
  ["indigo-dorado", "Índigo con raya dorada", 35, "#6366f1", "#eab308", "#c7d2fe", "#4338ca", null],
  ["blanco-dorado", "Blanca con raya dorada", 35, "#f8fafc", "#eab308", "#e2e8f0", "#94a3b8", "#1f2937"],
  ["azul-rosa", "Azul con raya rosa", 20, "#3b82f6", "#ec4899", "#bfdbfe", "#1d4ed8", null],
  ["amarillo-indigo", "Amarilla con raya índigo", 20, "#facc15", "#6366f1", "#fef08a", "#ca8a04", "#1f2937"],
  ["naranja-menta", "Naranja con raya menta", 20, "#f97316", "#2dd4bf", "#fed7aa", "#c2410c", null],
  ["azul-morado", "Azul con raya morada", 20, "#3b82f6", "#a855f7", "#bfdbfe", "#1d4ed8", null],
  ["naranja-rojo", "Naranja con raya roja", 20, "#f97316", "#ef4444", "#fed7aa", "#c2410c", null],
  ["indigo-naranja", "Índigo con raya naranja", 20, "#6366f1", "#f97316", "#c7d2fe", "#4338ca", null],
  ["rojo-dorado", "Roja con raya dorada", 35, "#ef4444", "#eab308", "#fecaca", "#b91c1c", null],
  ["negro-cafe", "Negra con raya café", 20, "#1f2937", "#92400e", "#9ca3af", "#030712", null],
  ["azul-menta", "Azul con raya menta", 20, "#3b82f6", "#2dd4bf", "#bfdbfe", "#1d4ed8", null],
  ["blanco-cafe", "Blanca con raya café", 20, "#f8fafc", "#92400e", "#e2e8f0", "#94a3b8", "#1f2937"],
  ["cafe-azul", "Café con raya azul", 20, "#92400e", "#3b82f6", "#fde68a", "#451a03", null],
  ["morado-blanco", "Morada con raya blanca", 20, "#a855f7", "#f8fafc", "#e9d5ff", "#7e22ce", null],
  ["negro-verde", "Negra con raya verde", 20, "#1f2937", "#22c55e", "#9ca3af", "#030712", null],
  ["amarillo-rojo", "Amarilla con raya roja", 20, "#facc15", "#ef4444", "#fef08a", "#ca8a04", "#1f2937"],
  ["azul-blanco", "Azul con raya blanca", 20, "#3b82f6", "#f8fafc", "#bfdbfe", "#1d4ed8", null],
  ["rosa-rojo", "Rosa con raya roja", 20, "#ec4899", "#ef4444", "#fbcfe8", "#be185d", null],
  ["menta-amarillo", "Menta con raya amarilla", 20, "#2dd4bf", "#facc15", "#ccfbf1", "#0f766e", null],
  ["negro-azul", "Negra con raya azul", 20, "#1f2937", "#3b82f6", "#9ca3af", "#030712", null],
  ["rojo-amarillo", "Roja con raya amarilla", 20, "#ef4444", "#facc15", "#fecaca", "#b91c1c", null],
  ["morado-negro", "Morada con raya negra", 20, "#a855f7", "#1f2937", "#e9d5ff", "#7e22ce", null],
  ["menta-morado", "Menta con raya morada", 20, "#2dd4bf", "#a855f7", "#ccfbf1", "#0f766e", null],
  ["indigo-amarillo", "Índigo con raya amarilla", 20, "#6366f1", "#facc15", "#c7d2fe", "#4338ca", null],
  ["morado-indigo", "Morada con raya índigo", 20, "#a855f7", "#6366f1", "#e9d5ff", "#7e22ce", null],
  ["amarillo-cafe", "Amarilla con raya café", 20, "#facc15", "#92400e", "#fef08a", "#ca8a04", "#1f2937"],
  ["blanco-rosa", "Blanca con raya rosa", 20, "#f8fafc", "#ec4899", "#e2e8f0", "#94a3b8", "#1f2937"],
  ["naranja-blanco", "Naranja con raya blanca", 20, "#f97316", "#f8fafc", "#fed7aa", "#c2410c", null],
  ["azul-rojo", "Azul con raya roja", 20, "#3b82f6", "#ef4444", "#bfdbfe", "#1d4ed8", null],
  ["indigo-rojo", "Índigo con raya roja", 20, "#6366f1", "#ef4444", "#c7d2fe", "#4338ca", null],
  ["blanco-amarillo", "Blanca con raya amarilla", 20, "#f8fafc", "#facc15", "#e2e8f0", "#94a3b8", "#1f2937"],
  ["rosa-azul", "Rosa con raya azul", 20, "#ec4899", "#3b82f6", "#fbcfe8", "#be185d", null],
  ["azul-naranja", "Azul con raya naranja", 20, "#3b82f6", "#f97316", "#bfdbfe", "#1d4ed8", null],
  ["cafe-blanco", "Café con raya blanca", 20, "#92400e", "#f8fafc", "#fde68a", "#451a03", null],
  ["verde-negro", "Verde con raya negra", 20, "#22c55e", "#1f2937", "#bbf7d0", "#15803d", null],
  ["verde-menta", "Verde con raya menta", 20, "#22c55e", "#2dd4bf", "#bbf7d0", "#15803d", null],
  ["morado-rojo", "Morada con raya roja", 20, "#a855f7", "#ef4444", "#e9d5ff", "#7e22ce", null],
  ["verde-rosa", "Verde con raya rosa", 20, "#22c55e", "#ec4899", "#bbf7d0", "#15803d", null],
  ["indigo-menta", "Índigo con raya menta", 20, "#6366f1", "#2dd4bf", "#c7d2fe", "#4338ca", null],
  ["cafe-rojo", "Café con raya roja", 20, "#92400e", "#ef4444", "#fde68a", "#451a03", null],
];
