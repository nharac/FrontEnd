import { Injectable, computed, signal } from '@angular/core';
import { BUFANDAS_VARIANTES, VARIANTES, Variante } from '../../shared/components/mascota/sumi-variantes';

/** Lo que Sumi lleva en la cabeza. */
export type SombreroSumi = string;
/** Lo que Sumi lleva en la cara. */
export type CaraSumi = string;
/** Lo que Sumi lleva en la mano izquierda (la derecha es para los accesorios de cada módulo). */
export type ObjetoSumi = string;
/** Lo que Sumi lleva en la espalda. */
export type EspaldaSumi = string;
/** Fondo del medallón detrás de Sumi (solo donde Sumi aparece grande). */
export type FondoSumi = string;
/** Colores de la bufanda. */
export type BufandaSumi = string;

/** Lo que Sumi lleva puesto, parte por parte (igual que en el backend). */
export interface EstiloSumi {
  sombrero: SombreroSumi;
  cara: CaraSumi;
  objeto: ObjetoSumi;
  espalda: EspaldaSumi;
  bufanda: BufandaSumi;
  fondo: FondoSumi;
}

export interface PrendaSumi<T extends string> {
  id: T;
  nombre: string;
  /** Precio en Sumi Monedas (0 = gratis para todos). El backend tiene los mismos precios (V25). */
  precio: number;
  descripcion: string;
}

/** Bufanda: [base, raya, punta, punta de atrás y nudo, color de la integral (opcional)]. */
export interface BufandaInfo extends PrendaSumi<BufandaSumi> {
  colores: string[];
}

/** Variante de color → prenda del catálogo (el dibujo lo usa la mascota desde sumi-prendas). */
function prenda(v: Variante): PrendaSumi<string> {
  return { id: v.id, nombre: v.nombre, precio: v.precio, descripcion: v.descripcion };
}

/** Lo gratis primero ("ninguno" de primero) y luego por precio y nombre. */
function ordenar<T extends PrendaSumi<string>>(lista: T[]): T[] {
  return [...lista].sort((a, b) => Number(b.id === 'ninguno') - Number(a.id === 'ninguno')
    || a.precio - b.precio || a.nombre.localeCompare(b.nombre, 'es'));
}

export const SOMBREROS: PrendaSumi<SombreroSumi>[] = ordenar([
  { id: 'ninguno', nombre: 'Al natural', precio: 0, descripcion: 'Sumi con su flor de frailejón.' },
  { id: 'gorro', nombre: 'Gorro de lana', precio: 0, descripcion: 'Para el frío del páramo.' },
  { id: 'ducha', nombre: 'Gorro de baño', precio: 10, descripcion: 'Recién bañadito.' },
  { id: 'vincha', nombre: 'Vincha deportiva', precio: 10, descripcion: 'Lista para la clase de educación física.' },
  { id: 'flor', nombre: 'Flor en el pelo', precio: 15, descripcion: 'Coqueta y primaveral.' },
  { id: 'gato', nombre: 'Orejas de gato', precio: 15, descripcion: 'Miau-temáticas.' },
  { id: 'gorra', nombre: 'Gorra SAESU', precio: 20, descripcion: 'Con la integral bordada.' },
  { id: 'raton', nombre: 'Orejas de ratón', precio: 20, descripcion: 'Pequeño pero listo.' },
  { id: 'pescador', nombre: 'Gorro de pescador', precio: 20, descripcion: 'Para pescar buenas notas.' },
  { id: 'chef', nombre: 'Gorro de chef', precio: 25, descripcion: 'Cocinando soluciones.' },
  { id: 'lazo', nombre: 'Lazo rojo', precio: 25, descripcion: 'Como un regalo.' },
  { id: 'dormir', nombre: 'Gorro de dormir', precio: 30, descripcion: 'Para soñar con derivadas.' },
  { id: 'huevo', nombre: 'Huevo frito', precio: 30, descripcion: 'Desayuno en la cabeza.' },
  { id: 'fiesta', nombre: 'Gorro de fiesta', precio: 30, descripcion: 'Para celebrar cada logro.' },
  { id: 'cono', nombre: 'Cono de tránsito', precio: 30, descripcion: 'Precaución: cerebro trabajando.' },
  { id: 'conejo', nombre: 'Orejas de conejo', precio: 30, descripcion: 'Saltando de tema en tema.' },
  { id: 'obra', nombre: 'Casco de obra', precio: 35, descripcion: 'Construyendo conocimiento.' },
  { id: 'visera', nombre: 'Visera', precio: 40, descripcion: 'Para el sol del mediodía.' },
  { id: 'mono', nombre: 'Moño', precio: 40, descripcion: 'Un toque coqueto junto a la flor.' },
  { id: 'panda', nombre: 'Orejas de panda', precio: 40, descripcion: 'Comelón de bambú.' },
  { id: 'paja', nombre: 'Sombrero de paja', precio: 45, descripcion: 'Fresquito para el sol de Fusa.' },
  { id: 'marinero', nombre: 'Gorro de marinero', precio: 45, descripcion: 'Navegando entre ejercicios.' },
  { id: 'reves', nombre: 'Gorra al revés', precio: 50, descripcion: 'Estilo relajado.' },
  { id: 'boina', nombre: 'Boina', precio: 50, descripcion: 'Estilo de artista.' },
  { id: 'bici', nombre: 'Casco de bici', precio: 50, descripcion: 'A pedalear a la U.' },
  { id: 'oso', nombre: 'Gorro de oso', precio: 60, descripcion: 'Abrazable.' },
  { id: 'navidad', nombre: 'Gorro navideño', precio: 60, descripcion: 'Jo, jo, jo… y a estudiar.' },
  { id: 'zorro', nombre: 'Orejas de zorro', precio: 60, descripcion: 'Astuto como ninguno.' },
  { id: 'reno', nombre: 'Cuernos de reno', precio: 65, descripcion: 'Con nariz roja incluida.' },
  { id: 'rana', nombre: 'Gorro de rana', precio: 70, descripcion: 'Croac, croac.' },
  { id: 'pirata', nombre: 'Pañuelo pirata', precio: 70, descripcion: 'A la caza del tesoro (el 5.0).' },
  { id: 'otono', nombre: 'Corona de otoño', precio: 70, descripcion: 'Hojitas de colores.' },
  { id: 'ninja', nombre: 'Cinta ninja', precio: 75, descripcion: 'Sigiloso en los quices.' },
  { id: 'flores', nombre: 'Corona de flores', precio: 75, descripcion: 'Florecita del páramo.' },
  { id: 'audifonos', nombre: 'Audífonos', precio: 80, descripcion: 'Para estudiar con música.' },
  { id: 'playa', nombre: 'Sombrero de playa', precio: 85, descripcion: 'Vacaciones merecidas.' },
  { id: 'diablito', nombre: 'Cuernitos', precio: 90, descripcion: 'Travieso pero estudioso.' },
  { id: 'antenas', nombre: 'Antenas', precio: 90, descripcion: 'Recibiendo señales del espacio.' },
  { id: 'chullo', nombre: 'Chullo andino', precio: 95, descripcion: 'Calientito, de lana.' },
  { id: 'safari', nombre: 'Casco de explorador', precio: 100, descripcion: 'Explorando nuevos temas.' },
  { id: 'elfo', nombre: 'Gorro de elfo', precio: 105, descripcion: 'Ayudante del semestre.' },
  { id: 'vaquero', nombre: 'Sombrero vaquero', precio: 110, descripcion: 'Yeehaw, a resolver integrales.' },
  { id: 'nube', nombre: 'Nube', precio: 110, descripcion: 'Con la cabeza en las nubes.' },
  { id: 'bombero', nombre: 'Casco de bombero', precio: 120, descripcion: 'Apagando incendios antes del parcial.' },
  { id: 'bruja', nombre: 'Sombrero de bruja', precio: 120, descripcion: 'Hechizos de álgebra.' },
  { id: 'helice', nombre: 'Gorro con hélice', precio: 130, descripcion: 'Las ideas vuelan.' },
  { id: 'minero', nombre: 'Casco de minero', precio: 130, descripcion: 'Buscando el oro del conocimiento.' },
  { id: 'bufon', nombre: 'Gorro de bufón', precio: 140, descripcion: 'Ríe y aprende.' },
  { id: 'vueltiao', nombre: 'Sombrero vueltiao', precio: 140, descripcion: 'Bien colombiano.' },
  { id: 'aviadorgorro', nombre: 'Gorro de aviador', precio: 150, descripcion: 'Listo para despegar.' },
  { id: 'tiara', nombre: 'Tiara', precio: 160, descripcion: 'Brilla en cada quiz.' },
  { id: 'capitan', nombre: 'Gorra de capitán', precio: 165, descripcion: 'Al mando del curso.' },
  { id: 'fedora', nombre: 'Fedora', precio: 170, descripcion: 'Clásica y elegante.' },
  { id: 'moto', nombre: 'Casco de moto', precio: 180, descripcion: 'Seguridad ante todo.' },
  { id: 'copa', nombre: 'Sombrero de copa', precio: 180, descripcion: 'Muy elegante.' },
  { id: 'estrellas', nombre: 'Diadema de estrellas', precio: 185, descripcion: 'Siempre brillando.' },
  { id: 'aguadeno', nombre: 'Sombrero aguadeño', precio: 195, descripcion: 'Tradición de Aguadas, Caldas.' },
  { id: 'mago', nombre: 'Sombrero de mago', precio: 200, descripcion: 'Las derivadas como por arte de magia.' },
  { id: 'unicornio', nombre: 'Diadema de unicornio', precio: 210, descripcion: 'Mágica y única.' },
  { id: 'vikingo', nombre: 'Casco vikingo', precio: 220, descripcion: 'Conquistando el cálculo.' },
  { id: 'tricornio', nombre: 'Tricornio pirata', precio: 230, descripcion: 'Capitán de los siete mares.' },
  { id: 'aureola', nombre: 'Aureola', precio: 240, descripcion: 'Un angelito del estudio.' },
  { id: 'detective', nombre: 'Gorro de detective', precio: 250, descripcion: 'Resolviendo el caso de la x.' },
  { id: 'mariachi', nombre: 'Sombrero de mariachi', precio: 260, descripcion: 'Con serenata incluida.' },
  { id: 'romano', nombre: 'Casco romano', precio: 280, descripcion: 'Veni, vidi, estudié.' },
  { id: 'bombilla', nombre: 'Bombillo de idea', precio: 290, descripcion: '¡Se me ocurrió!' },
  { id: 'corona', nombre: 'Corona', precio: 300, descripcion: 'Para la realeza del cálculo.' },
  { id: 'laurel', nombre: 'Corona de laurel', precio: 320, descripcion: 'Victoria académica.' },
  { id: 'pollito', nombre: 'Pollito', precio: 360, descripcion: 'Pío, pío.' },
  { id: 'astronauta', nombre: 'Casco de astronauta', precio: 440, descripcion: 'Directo a la Luna.' },
  ...VARIANTES.cabeza.map(prenda),
]);

export const CARAS: PrendaSumi<CaraSumi>[] = ordenar([
  { id: 'ninguno', nombre: 'Sin nada', precio: 0, descripcion: 'Su carita de siempre.' },
  { id: 'pecas', nombre: 'Pecas', precio: 0, descripcion: 'Tiernas y naturales.' },
  { id: 'lunar', nombre: 'Lunar', precio: 5, descripcion: 'Un detallito.' },
  { id: 'bigote', nombre: 'Bigote', precio: 10, descripcion: 'Muy distinguido.' },
  { id: 'curita', nombre: 'Curita', precio: 10, descripcion: 'Golpecito en el recreo.' },
  { id: 'tapabocas', nombre: 'Tapabocas', precio: 15, descripcion: 'Cuidándonos entre todos.' },
  { id: 'bigotesgato', nombre: 'Bigotes de gato', precio: 20, descripcion: 'Miau.' },
  { id: 'estrellitas', nombre: 'Estrellitas', precio: 20, descripcion: 'Brillo en las mejillas.' },
  { id: 'nerd', nombre: 'Gafas de nerd', precio: 25, descripcion: 'Con cinta y todo.' },
  { id: 'payaso', nombre: 'Nariz de payaso', precio: 25, descripcion: 'Para reír un rato.' },
  { id: 'cejas', nombre: 'Cejas pobladas', precio: 30, descripcion: 'Muy expresivas.' },
  { id: 'pintucaritas', nombre: 'Pintucaritas tricolor', precio: 30, descripcion: 'Hinchada de la Selección.' },
  { id: 'dientes', nombre: 'Dientes de conejo', precio: 35, descripcion: 'Mordisco a la zanahoria.' },
  { id: 'frances', nombre: 'Bigote francés', precio: 35, descripcion: 'Oh là là.' },
  { id: 'parche', nombre: 'Parche pirata', precio: 40, descripcion: 'Arrr.' },
  { id: 'pestanas', nombre: 'Pestañas largas', precio: 40, descripcion: 'Mirada de estrella.' },
  { id: 'chivo', nombre: 'Barba de chivo', precio: 45, descripcion: 'Pensativo.' },
  { id: 'sol', nombre: 'Gafas de sol', precio: 50, descripcion: 'Demasiado cool para el parcial.' },
  { id: 'mejillascor', nombre: 'Mejillas de corazón', precio: 50, descripcion: 'Puro amor.' },
  { id: 'laboratorio', nombre: 'Gafas de laboratorio', precio: 50, descripcion: 'Seguridad en el experimento.' },
  { id: 'chupo', nombre: 'Chupo', precio: 60, descripcion: 'Bebé del semestre.' },
  { id: 'gafas3d', nombre: 'Gafas 3D', precio: 60, descripcion: 'Ve las funciones en tres dimensiones.' },
  { id: 'abuelito', nombre: 'Gafas de abuelito', precio: 65, descripcion: 'Leyendo la letra pequeña.' },
  { id: 'manubrio', nombre: 'Bigote de manubrio', precio: 70, descripcion: 'Todo un caballero.' },
  { id: 'vampiro', nombre: 'Colmillos', precio: 75, descripcion: 'Chupa… conocimiento.' },
  { id: 'antifaz', nombre: 'Antifaz', precio: 80, descripcion: 'Superhéroe de las matemáticas.' },
  { id: 'morsa', nombre: 'Bigote de morsa', precio: 80, descripcion: 'Abundante y peludo.' },
  { id: 'corazon', nombre: 'Gafas de corazón', precio: 90, descripcion: 'Enamorada de las matemáticas.' },
  { id: 'gatogafas', nombre: 'Gafas de gatita', precio: 95, descripcion: 'Retro y coquetas.' },
  { id: 'barba', nombre: 'Barba', precio: 100, descripcion: 'Sabiduría del páramo.' },
  { id: 'hexagonales', nombre: 'Gafas hexagonales', precio: 110, descripcion: 'Geometría con estilo.' },
  { id: 'buceo', nombre: 'Careta de buceo', precio: 120, descripcion: 'Explorando el fondo del mar.' },
  { id: 'monoculo', nombre: 'Monóculo', precio: 120, descripcion: 'Elemental, querido estudiante.' },
  { id: 'retro', nombre: 'Gafas retro', precio: 140, descripcion: 'Vintage de los 70.' },
  { id: 'aviador', nombre: 'Gafas de aviador', precio: 140, descripcion: 'Despegando hacia el 5.0.' },
  { id: 'esqui', nombre: 'Gafas de esquí', precio: 165, descripcion: 'Bajando la montaña de tareas.' },
  { id: 'visor', nombre: 'Visor futurista', precio: 180, descripcion: 'Directo del año 3000.' },
  { id: 'burbujas', nombre: 'Pipa de burbujas', precio: 190, descripcion: 'Relax total.' },
  { id: 'estrella', nombre: 'Gafas de estrella', precio: 200, descripcion: 'Una verdadera estrella.' },
  { id: 'steampunk', nombre: 'Gafas steampunk', precio: 270, descripcion: 'Inventor del siglo XIX.' },
  { id: 'cyborg', nombre: 'Ojo biónico', precio: 340, descripcion: 'Mitad Sumi, mitad máquina.' },
  ...VARIANTES.cara.map(prenda),
]);

export const OBJETOS: PrendaSumi<ObjetoSumi>[] = ordenar([
  { id: 'ninguno', nombre: 'Manos libres', precio: 0, descripcion: 'Sin nada en la mano.' },
  { id: 'cafe', nombre: 'Café', precio: 0, descripcion: 'Combustible para estudiar.' },
  { id: 'cuaderno', nombre: 'Cuaderno', precio: 5, descripcion: 'Apuntes al día.' },
  { id: 'regla', nombre: 'Regla', precio: 5, descripcion: 'Líneas bien rectas.' },
  { id: 'banano', nombre: 'Banano', precio: 5, descripcion: 'Energía natural.' },
  { id: 'escuadra', nombre: 'Escuadra', precio: 5, descripcion: 'Ángulos perfectos.' },
  { id: 'zanahoria', nombre: 'Zanahoria', precio: 5, descripcion: 'Buena para la vista.' },
  { id: 'manzana', nombre: 'Manzana', precio: 5, descripcion: 'Para el profe.' },
  { id: 'arepa', nombre: 'Arepa', precio: 10, descripcion: 'Desayuno de campeones.' },
  { id: 'transportador', nombre: 'Transportador', precio: 10, descripcion: 'Midiendo ángulos.' },
  { id: 'galleta', nombre: 'Galleta', precio: 10, descripcion: 'Con chips de chocolate.' },
  { id: 'chupeta', nombre: 'Chupeta', precio: 10, descripcion: 'Bombombúm de colores.' },
  { id: 'helado', nombre: 'Helado', precio: 10, descripcion: 'Tres sabores.' },
  { id: 'pila', nombre: 'Pila', precio: 10, descripcion: 'Cargado de energía.' },
  { id: 'jugo', nombre: 'Cajita de jugo', precio: 15, descripcion: 'Sabor a mora.' },
  { id: 'sandia', nombre: 'Sandía', precio: 15, descripcion: 'Fresquita.' },
  { id: 'dado', nombre: 'Dado', precio: 15, descripcion: 'A la suerte… o mejor estudia.' },
  { id: 'empanada', nombre: 'Empanada', precio: 15, descripcion: 'Con ají, por favor.' },
  { id: 'mango', nombre: 'Mango', precio: 15, descripcion: 'Biche con sal y limón.' },
  { id: 'girasol', nombre: 'Girasol', precio: 20, descripcion: 'Siempre mirando al sol.' },
  { id: 'aguacate', nombre: 'Aguacate', precio: 20, descripcion: 'Para el almuerzo.' },
  { id: 'celular', nombre: 'Celular', precio: 20, descripcion: 'Para practicar desde cualquier lado.' },
  { id: 'baguette', nombre: 'Pan francés', precio: 25, descripcion: 'Recién salido del horno.' },
  { id: 'compas', nombre: 'Compás', precio: 25, descripcion: 'Círculos perfectos.' },
  { id: 'globo', nombre: 'Globo', precio: 25, descripcion: 'Para la fiesta del 5.0.' },
  { id: 'dona', nombre: 'Dona', precio: 25, descripcion: 'Con chispitas.' },
  { id: 'yoyo', nombre: 'Yoyó', precio: 25, descripcion: 'Sube y baja.' },
  { id: 'bunuelo', nombre: 'Buñuelo', precio: 30, descripcion: 'De diciembre todo el año.' },
  { id: 'usb', nombre: 'Memoria USB', precio: 30, descripcion: 'Todo el semestre guardado.' },
  { id: 'pizza', nombre: 'Pizza', precio: 30, descripcion: 'Para la noche de estudio.' },
  { id: 'palomitas', nombre: 'Palomitas', precio: 30, descripcion: 'Noche de películas.' },
  { id: 'cupcake', nombre: 'Cupcake', precio: 35, descripcion: 'Para celebrar.' },
  { id: 'osito', nombre: 'Osito', precio: 35, descripcion: 'Compañero de estudio.' },
  { id: 'trompo', nombre: 'Trompo', precio: 35, descripcion: 'Juego de toda la vida.' },
  { id: 'cactus', nombre: 'Cactus en matera', precio: 40, descripcion: 'No necesita mucha agua.' },
  { id: 'bandera', nombre: 'Bandera de Colombia', precio: 40, descripcion: '¡Vamos, Colombia!' },
  { id: 'calculadora', nombre: 'Calculadora', precio: 40, descripcion: 'La científica de confianza.' },
  { id: 'mouse', nombre: 'Mouse', precio: 40, descripcion: 'Clic, clic.' },
  { id: 'linterna', nombre: 'Linterna', precio: 45, descripcion: 'Iluminando dudas.' },
  { id: 'perro', nombre: 'Perro caliente', precio: 45, descripcion: 'Con todas las salsas.' },
  { id: 'paraguas', nombre: 'Paraguas', precio: 50, descripcion: 'Para los aguaceros de Fusa.' },
  { id: 'iman', nombre: 'Imán', precio: 55, descripcion: 'Atrae buenas notas.' },
  { id: 'paleta', nombre: 'Paleta de pintor', precio: 55, descripcion: 'Artista de las gráficas.' },
  { id: 'hamburguesa', nombre: 'Hamburguesa', precio: 60, descripcion: 'Doble carne.' },
  { id: 'matraz', nombre: 'Tubo de ensayo', precio: 60, descripcion: 'Ciencia en acción.' },
  { id: 'pesa', nombre: 'Pesa', precio: 65, descripcion: 'Fuerza mental y física.' },
  { id: 'pc', nombre: 'Portátil', precio: 70, descripcion: 'Con SAESU abierto, claro.' },
  { id: 'algodon', nombre: 'Algodón de azúcar', precio: 70, descripcion: 'Dulce nube rosada.' },
  { id: 'raqueta', nombre: 'Raqueta', precio: 75, descripcion: 'Un set entre clase y clase.' },
  { id: 'bate', nombre: 'Bate', precio: 80, descripcion: '¡Jonrón!' },
  { id: 'tablet', nombre: 'Tablet', precio: 80, descripcion: 'Apuntes digitales.' },
  { id: 'brujula', nombre: 'Brújula', precio: 85, descripcion: 'Nunca te pierdes.' },
  { id: 'control', nombre: 'Control de videojuego', precio: 90, descripcion: 'Un ratico de descanso.' },
  { id: 'maracas', nombre: 'Maracas', precio: 90, descripcion: 'Con ritmo caribeño.' },
  { id: 'reloj', nombre: 'Reloj de arena', precio: 95, descripcion: 'El tiempo vuela.' },
  { id: 'balon', nombre: 'Balón', precio: 100, descripcion: 'Para el partido después de clase.' },
  { id: 'cometa', nombre: 'Cometa', precio: 110, descripcion: 'Volando en agosto.' },
  { id: 'microfono', nombre: 'Micrófono', precio: 110, descripcion: 'Para exponer sin nervios.' },
  { id: 'basquet', nombre: 'Balón de básquet', precio: 120, descripcion: 'Encestando ejercicios.' },
  { id: 'tambor', nombre: 'Tambor', precio: 120, descripcion: 'Bum, bum, bum.' },
  { id: 'camara', nombre: 'Cámara', precio: 130, descripcion: 'Para la foto del grado.' },
  { id: 'robot', nombre: 'Robot de juguete', precio: 130, descripcion: 'Bip bup.' },
  { id: 'guitarra', nombre: 'Guitarra', precio: 150, descripcion: 'Serenata para el profe.' },
  { id: 'cubo', nombre: 'Cubo mágico', precio: 150, descripcion: 'Lógica en tus manos.' },
  { id: 'atomo', nombre: 'Átomo', precio: 175, descripcion: 'Ciencia pura.' },
  { id: 'trompeta', nombre: 'Trompeta', precio: 190, descripcion: 'Ta-ra-rá.' },
  { id: 'telescopio', nombre: 'Telescopio', precio: 220, descripcion: 'Mirando las estrellas.' },
  { id: 'varita', nombre: 'Varita mágica', precio: 220, descripcion: 'Resuelve integrales con un toque.' },
  { id: 'cohete', nombre: 'Cohete', precio: 240, descripcion: 'Hasta el infinito (y la integral).' },
  { id: 'llave', nombre: 'Llave dorada', precio: 250, descripcion: 'Abre todas las puertas.' },
  { id: 'medalla', nombre: 'Medalla', precio: 300, descripcion: 'Primer puesto.' },
  { id: 'escoba', nombre: 'Escoba voladora', precio: 330, descripcion: 'Directo al aula.' },
  ...VARIANTES.mano.map(prenda),
]);

export const ESPALDAS: PrendaSumi<EspaldaSumi>[] = ordenar([
  { id: 'ninguno', nombre: 'Nada', precio: 0, descripcion: 'Sin nada en la espalda.' },
  { id: 'mochila', nombre: 'Mochila', precio: 0, descripcion: 'Con todos los cuadernos.' },
  { id: 'abeja', nombre: 'Alas de abeja', precio: 25, descripcion: 'Trabajadora como ninguna.' },
  { id: 'mochilaoso', nombre: 'Mochila de osito', precio: 45, descripcion: 'Tierna y espaciosa.' },
  { id: 'colagato', nombre: 'Cola de gato', precio: 50, descripcion: 'Elegante y curiosa.' },
  { id: 'capa', nombre: 'Capa de héroe', precio: 60, descripcion: 'Para salvar el semestre.' },
  { id: 'tortuga', nombre: 'Caparazón de tortuga', precio: 70, descripcion: 'Despacio pero seguro.' },
  { id: 'globos', nombre: 'Racimo de globos', precio: 75, descripcion: 'De fiesta todo el día.' },
  { id: 'colazorro', nombre: 'Cola de zorro', precio: 90, descripcion: 'Esponjosa.' },
  { id: 'mariposa', nombre: 'Alas de mariposa', precio: 100, descripcion: 'Transformación total.' },
  { id: 'tiburon', nombre: 'Aleta de tiburón', precio: 120, descripcion: 'Tiburón de las matemáticas.' },
  { id: 'murcielago', nombre: 'Alas de murciélago', precio: 140, descripcion: 'Para estudiar de noche.' },
  { id: 'estuche', nombre: 'Estuche de guitarra', precio: 140, descripcion: 'Músico de corazón.' },
  { id: 'hada', nombre: 'Alas de hada', precio: 165, descripcion: 'Polvo de estrellas.' },
  { id: 'angel', nombre: 'Alas de ángel', precio: 180, descripcion: 'Un angelito del páramo.' },
  { id: 'luna', nombre: 'Luna y estrellas', precio: 210, descripcion: 'Para las noches de estudio.' },
  { id: 'coladino', nombre: 'Cola de dinosaurio', precio: 240, descripcion: 'Rawr.' },
  { id: 'jetpack', nombre: 'Jetpack', precio: 260, descripcion: 'Despegue inmediato.' },
  { id: 'aura', nombre: 'Aura de estrellas', precio: 310, descripcion: 'Brillas con luz propia.' },
  { id: 'mecanicas', nombre: 'Alas mecánicas', precio: 380, descripcion: 'Ingeniería pura.' },
  { id: 'dragon', nombre: 'Alas de dragón', precio: 400, descripcion: 'Legendaria.' },
  { id: 'sol', nombre: 'Sol radiante', precio: 420, descripcion: 'Ilumina el salón.' },
  { id: 'arcoiris', nombre: 'Arcoíris', precio: 500, descripcion: 'La más difícil de conseguir.' },
  { id: 'fenix', nombre: 'Alas de fénix', precio: 520, descripcion: 'Renace en cada parcial.' },
  ...VARIANTES.espalda.map(prenda),
]);

export const FONDOS: PrendaSumi<FondoSumi>[] = ordenar([
  { id: 'ninguno', nombre: 'Sin fondo', precio: 0, descripcion: 'Sumi sola.' },
  { id: 'cielo', nombre: 'Cielo despejado', precio: 0, descripcion: 'Un día bonito.' },
  { id: 'paramo', nombre: 'Páramo de Sumapaz', precio: 0, descripcion: 'La casa de Sumi.' },
  { id: 'saesu', nombre: 'Índigo SAESU', precio: 0, descripcion: 'Los colores de la casa.' },
  { id: 'puntos', nombre: 'Lunares', precio: 5, descripcion: 'Clásico y tierno.' },
  { id: 'cuaderno', nombre: 'Hoja cuadriculada', precio: 5, descripcion: 'Lista para los apuntes.' },
  { id: 'rayas', nombre: 'Rayas', precio: 10, descripcion: 'Con mucho ritmo.' },
  { id: 'corazones', nombre: 'Corazones', precio: 10, descripcion: 'Mucho amor por aprender.' },
  { id: 'salon', nombre: 'Salón de clase', precio: 15, descripcion: 'Con el tablero lleno.' },
  { id: 'formulas', nombre: 'Fórmulas flotantes', precio: 20, descripcion: 'Las matemáticas en el aire.' },
  { id: 'lluvia', nombre: 'Día de lluvia', precio: 25, descripcion: 'Perfecto para estudiar en casa.' },
  { id: 'atardecer', nombre: 'Atardecer', precio: 30, descripcion: 'Cielo naranja de Fusa.' },
  { id: 'confeti', nombre: 'Confeti', precio: 35, descripcion: '¡Fiesta!' },
  { id: 'biblioteca', nombre: 'Biblioteca', precio: 40, descripcion: 'Silencio, se estudia.' },
  { id: 'bosque', nombre: 'Bosque', precio: 45, descripcion: 'Aire puro.' },
  { id: 'playa', nombre: 'Playa', precio: 50, descripcion: 'Sol, arena y mar.' },
  { id: 'cancha', nombre: 'Cancha de fútbol', precio: 55, descripcion: 'Para el partido del viernes.' },
  { id: 'noche', nombre: 'Noche estrellada', precio: 60, descripcion: 'Estudiando hasta tarde.' },
  { id: 'nieve', nombre: 'Nevado', precio: 70, descripcion: 'Frío de montaña.' },
  { id: 'desierto', nombre: 'Desierto', precio: 80, descripcion: 'Calor y dunas.' },
  { id: 'girasoles', nombre: 'Campo de girasoles', precio: 90, descripcion: 'Siempre mirando al sol.' },
  { id: 'cafetal', nombre: 'Cafetal', precio: 100, descripcion: 'Montañas del Eje Cafetero.' },
  { id: 'laboratorio', nombre: 'Laboratorio', precio: 110, descripcion: 'Experimentos en curso.' },
  { id: 'marino', nombre: 'Fondo del mar', precio: 120, descripcion: 'Glu, glu.' },
  { id: 'caribe', nombre: 'Caribe', precio: 130, descripcion: 'Brisa y mar turquesa.' },
  { id: 'arcoiris', nombre: 'Arcoíris', precio: 140, descripcion: 'Después de la lluvia.' },
  { id: 'ciudad', nombre: 'Ciudad de noche', precio: 150, descripcion: 'Luces de Bogotá.' },
  { id: 'espacio', nombre: 'Espacio', precio: 180, descripcion: 'Más allá de las estrellas.' },
  { id: 'codigo', nombre: 'Código', precio: 200, descripcion: 'Programando el futuro.' },
  { id: 'galaxia', nombre: 'Galaxia', precio: 280, descripcion: 'Infinita como las integrales.' },
  { id: 'aurora', nombre: 'Aurora boreal', precio: 360, descripcion: 'Un espectáculo del cielo.' },
  ...VARIANTES.fondo.map(prenda),
]);

export const BUFANDAS: BufandaInfo[] = ordenar([
  { id: 'saesu', nombre: 'Índigo SAESU', precio: 0, descripcion: 'La de siempre.', colores: ['#4f46e5', '#818cf8', '#6366f1', '#4338ca'] },
  { id: 'fresa', nombre: 'Fresa', precio: 10, descripcion: 'Dulce y roja.', colores: ['#f43f5e', '#fecdd3', '#fb7185', '#be123c'] },
  { id: 'paramo', nombre: 'Verde páramo', precio: 10, descripcion: 'Del color de Sumapaz.', colores: ['#16a34a', '#86efac', '#22c55e', '#15803d'] },
  { id: 'mandarina', nombre: 'Mandarina', precio: 10, descripcion: 'Cítrica.', colores: ['#fb923c', '#ffedd5', '#fdba74', '#c2410c'] },
  { id: 'menta', nombre: 'Menta', precio: 15, descripcion: 'Fresquita.', colores: ['#10b981', '#a7f3d0', '#34d399', '#047857'] },
  { id: 'kiwi', nombre: 'Kiwi', precio: 15, descripcion: 'Verde y jugosa.', colores: ['#65a30d', '#d9f99d', '#84cc16', '#3f6212'] },
  { id: 'cielo', nombre: 'Cielo', precio: 20, descripcion: 'Azul de día despejado.', colores: ['#0ea5e9', '#bae6fd', '#38bdf8', '#0369a1'] },
  { id: 'oceano', nombre: 'Océano', precio: 20, descripcion: 'Azul turquesa como el mar.', colores: ['#0891b2', '#a5f3fc', '#06b6d4', '#0e7490'] },
  { id: 'uva', nombre: 'Uva', precio: 20, descripcion: 'Morada intensa.', colores: ['#7e22ce', '#e9d5ff', '#9333ea', '#581c87'] },
  { id: 'durazno', nombre: 'Durazno', precio: 25, descripcion: 'Suave y cálida.', colores: ['#fdba74', '#fff7ed', '#fb923c', '#ea580c'] },
  { id: 'arandano', nombre: 'Arándano', precio: 25, descripcion: 'Azul oscuro y dulce.', colores: ['#3730a3', '#c7d2fe', '#4338ca', '#1e1b4b'] },
  { id: 'rosa', nombre: 'Rosa chicle', precio: 30, descripcion: 'Dulce y llamativa.', colores: ['#ec4899', '#fbcfe8', '#f472b6', '#db2777'] },
  { id: 'algodon', nombre: 'Algodón', precio: 30, descripcion: 'Suavecita.', colores: ['#fbcfe8', '#fff', '#f9a8d4', '#ec4899', '#be185d'] },
  { id: 'lavanda', nombre: 'Lavanda', precio: 35, descripcion: 'Tranquila como un domingo.', colores: ['#c4b5fd', '#f5f3ff', '#a78bfa', '#7c3aed'] },
  { id: 'cafeleche', nombre: 'Café con leche', precio: 40, descripcion: 'Para madrugar.', colores: ['#a16207', '#fef3c7', '#ca8a04', '#713f12'] },
  { id: 'cereza', nombre: 'Cereza', precio: 40, descripcion: 'Roja intensa.', colores: ['#be123c', '#fecdd3', '#e11d48', '#881337'] },
  { id: 'tinto', nombre: 'Tinto', precio: 40, descripcion: 'Bien colombiana.', colores: ['#451a03', '#d6a35c', '#78350f', '#1c0a00'] },
  { id: 'chocolate', nombre: 'Chocolate', precio: 45, descripcion: 'Con raya de caramelo.', colores: ['#78350f', '#fcd34d', '#92400e', '#451a03'] },
  { id: 'arena', nombre: 'Arena', precio: 50, descripcion: 'Tono playa.', colores: ['#e7d3a8', '#fff', '#d6c08f', '#a68a4f', '#78350f'] },
  { id: 'lila', nombre: 'Lila', precio: 50, descripcion: 'Suave y elegante.', colores: ['#8b5cf6', '#ede9fe', '#a78bfa', '#7c3aed'] },
  { id: 'grafito', nombre: 'Grafito', precio: 50, descripcion: 'Seria y moderna.', colores: ['#475569', '#cbd5e1', '#64748b', '#334155'] },
  { id: 'oliva', nombre: 'Oliva', precio: 55, descripcion: 'Natural y serena.', colores: ['#4d7c0f', '#ecfccb', '#65a30d', '#365314'] },
  { id: 'limon', nombre: 'Limón', precio: 55, descripcion: 'Ácida y alegre.', colores: ['#a3e635', '#ecfccb', '#bef264', '#65a30d'] },
  { id: 'atardecer', nombre: 'Atardecer', precio: 60, descripcion: 'Naranja con raya amarilla.', colores: ['#f97316', '#fde047', '#fb923c', '#ea580c'] },
  { id: 'bosque', nombre: 'Bosque', precio: 60, descripcion: 'Del monte.', colores: ['#166534', '#bbf7d0', '#15803d', '#14532d'] },
  { id: 'coral', nombre: 'Coral', precio: 65, descripcion: 'Como el arrecife.', colores: ['#fb7185', '#ffe4e6', '#fda4af', '#e11d48'] },
  { id: 'pino', nombre: 'Pino', precio: 70, descripcion: 'Navideña.', colores: ['#14532d', '#ef4444', '#166534', '#052e16'] },
  { id: 'mostaza', nombre: 'Mostaza', precio: 70, descripcion: 'Con mucho estilo.', colores: ['#ca8a04', '#fef08a', '#eab308', '#854d0e'] },
  { id: 'turquesa', nombre: 'Turquesa', precio: 75, descripcion: 'Caribe puro.', colores: ['#14b8a6', '#ccfbf1', '#2dd4bf', '#0f766e'] },
  { id: 'nieve', nombre: 'Nieve', precio: 80, descripcion: 'Blanca con raya roja.', colores: ['#f8fafc', '#ef4444', '#e2e8f0', '#cbd5e1', '#ef4444'] },
  { id: 'aguamarina', nombre: 'Aguamarina', precio: 80, descripcion: 'Fresca como el mar.', colores: ['#22d3ee', '#ecfeff', '#67e8f9', '#0891b2'] },
  { id: 'vino', nombre: 'Vino', precio: 85, descripcion: 'Elegancia total.', colores: ['#7f1d1d', '#fca5a5', '#991b1b', '#450a0a'] },
  { id: 'cobalto', nombre: 'Cobalto', precio: 90, descripcion: 'Azul eléctrico.', colores: ['#2563eb', '#fde047', '#3b82f6', '#1e40af'] },
  { id: 'medianoche', nombre: 'Medianoche', precio: 95, descripcion: 'Con raya plateada.', colores: ['#0f172a', '#cbd5e1', '#1e293b', '#020617'] },
  { id: 'noche', nombre: 'Noche de estudio', precio: 100, descripcion: 'Oscura con raya dorada.', colores: ['#1e293b', '#fbbf24', '#334155', '#0f172a'] },
  { id: 'ciruela', nombre: 'Ciruela', precio: 105, descripcion: 'Elegante.', colores: ['#86198f', '#f5d0fe', '#a21caf', '#4a044e'] },
  { id: 'magenta', nombre: 'Magenta', precio: 110, descripcion: 'Vibrante.', colores: ['#c026d3', '#fae8ff', '#d946ef', '#86198f'] },
  { id: 'esmeralda', nombre: 'Esmeralda', precio: 120, descripcion: 'Verde joya.', colores: ['#047857', '#6ee7b7', '#059669', '#064e3b'] },
  { id: 'fucsia', nombre: 'Fucsia', precio: 120, descripcion: 'Llamativa.', colores: ['#db2777', '#fde047', '#ec4899', '#9d174d'] },
  { id: 'salmon', nombre: 'Salmón', precio: 130, descripcion: 'Suave y cálida.', colores: ['#fca5a5', '#fff1f2', '#fecaca', '#ef4444', '#b91c1c'] },
  { id: 'terracota', nombre: 'Terracota', precio: 140, descripcion: 'Como las tejas.', colores: ['#c2410c', '#fed7aa', '#ea580c', '#7c2d12'] },
  { id: 'zafiro', nombre: 'Zafiro', precio: 140, descripcion: 'Azul joya.', colores: ['#1d4ed8', '#93c5fd', '#2563eb', '#1e3a8a'] },
  { id: 'ladrillo', nombre: 'Ladrillo', precio: 150, descripcion: 'Firme.', colores: ['#9a3412', '#fdba74', '#c2410c', '#431407'] },
  { id: 'colombia', nombre: 'Tricolor', precio: 160, descripcion: 'Amarillo, azul y rojo.', colores: ['#fcd116', '#003893', '#ce1126', '#003893'] },
  { id: 'neon', nombre: 'Neón', precio: 200, descripcion: 'Brilla en la oscuridad.', colores: ['#111827', '#4ade80', '#1f2937', '#030712'] },
  { id: 'plata', nombre: 'Plata', precio: 220, descripcion: 'Brillante.', colores: ['#cbd5e1', '#fff', '#e2e8f0', '#94a3b8', '#334155'] },
  { id: 'bronce', nombre: 'Bronce', precio: 260, descripcion: 'Tercer lugar con honor.', colores: ['#b45309', '#fde68a', '#d97706', '#78350f'] },
  { id: 'oro', nombre: 'Dorada', precio: 300, descripcion: 'Solo para leyendas.', colores: ['#eab308', '#fef3c7', '#facc15', '#a16207'] },
  { id: 'perla', nombre: 'Perla', precio: 400, descripcion: 'Rara y preciosa.', colores: ['#f5f5f4', '#e9d5ff', '#fafaf9', '#d6d3d1', '#7c3aed'] },
  ...BUFANDAS_VARIANTES.map(([id, nombre, precio, base, raya, punta, atras, texto]) => ({
    id, nombre, precio, descripcion: 'Combina con todo.', colores: texto ? [base, raya, punta, atras, texto] : [base, raya, punta, atras],
  })),
]);

const CLAVE = 'saesu-sumi-estilo';
/** Token de la sesión (lo guarda TokenService). */
const CLAVE_SESION = 'saesu_token';

/**
 * El estilo que cada persona eligió para Sumi en el vestidor (perfil).
 * Lo usan todas las <app-mascota> que no pidan un estilo propio.
 * El servidor guarda el oficial (TiendaSumiService); aquí queda una copia en el navegador
 * para que Sumi salga vestida desde el primer momento.
 */
@Injectable({ providedIn: 'root' })
export class EstiloSumiService {
  readonly sombrero = signal<SombreroSumi>('ninguno');
  readonly cara = signal<CaraSumi>('ninguno');
  readonly objeto = signal<ObjetoSumi>('ninguno');
  readonly espalda = signal<EspaldaSumi>('ninguno');
  readonly fondo = signal<FondoSumi>('ninguno');
  readonly bufanda = signal<BufandaSumi>('saesu');
  /** true cuando lleva algo distinto a lo de siempre. */
  readonly personalizado = computed(() => this.sombrero() !== 'ninguno' || this.cara() !== 'ninguno'
    || this.objeto() !== 'ninguno' || this.espalda() !== 'ninguno' || this.fondo() !== 'ninguno' || this.bufanda() !== 'saesu');

  /** Quienes deben limpiar su copia cuando se cierra la sesión (la tienda de monedas). */
  private readonly alCerrarSesion: (() => void)[] = [];

  constructor() {
    try {
      // La copia del navegador es de la cuenta abierta: sin sesión, Sumi sale clásica
      if (localStorage.getItem(CLAVE_SESION)) {
        this.aplicar(JSON.parse(localStorage.getItem(CLAVE) ?? 'null') ?? {}, false);
      }
    } catch {
      // guardado dañado o sin acceso a localStorage: Sumi de siempre
    }
  }

  /** Registra algo que se debe limpiar al cerrar sesión. */
  alOlvidar(limpiar: () => void): void {
    this.alCerrarSesion.push(limpiar);
  }

  /**
   * Al cerrar sesión (o si vence): Sumi vuelve a su forma clásica para quien llegue después
   * y se borra la copia de este navegador. El estilo de la cuenta sigue guardado en el servidor.
   */
  olvidar(): void {
    this.clasica();
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      // sin localStorage no hay copia que borrar
    }
    this.alCerrarSesion.forEach(limpiar => limpiar());
  }

  /** Pone lo que venga (del servidor o del navegador), ignorando prendas que no existen. */
  aplicar(e: Partial<EstiloSumi>, guardar = true): void {
    if (SOMBREROS.some(s => s.id === e?.sombrero)) this.sombrero.set(e.sombrero!);
    if (CARAS.some(c => c.id === e?.cara)) this.cara.set(e.cara!);
    if (OBJETOS.some(o => o.id === e?.objeto)) this.objeto.set(e.objeto!);
    if (ESPALDAS.some(x => x.id === e?.espalda)) this.espalda.set(e.espalda!);
    if (FONDOS.some(f => f.id === e?.fondo)) this.fondo.set(e.fondo!);
    if (BUFANDAS.some(b => b.id === e?.bufanda)) this.bufanda.set(e.bufanda!);
    if (guardar) this.guardar();
  }

  comoMapa(): EstiloSumi {
    return {
      sombrero: this.sombrero(), cara: this.cara(), objeto: this.objeto(),
      espalda: this.espalda(), bufanda: this.bufanda(), fondo: this.fondo(),
    };
  }


  ponerSombrero(id: SombreroSumi): void {
    this.sombrero.set(id);
    this.guardar();
  }

  ponerCara(id: CaraSumi): void {
    this.cara.set(id);
    this.guardar();
  }

  ponerObjeto(id: ObjetoSumi): void {
    this.objeto.set(id);
    this.guardar();
  }

  ponerEspalda(id: EspaldaSumi): void {
    this.espalda.set(id);
    this.guardar();
  }

  ponerFondo(id: FondoSumi): void {
    this.fondo.set(id);
    this.guardar();
  }

  ponerBufanda(id: BufandaSumi): void {
    this.bufanda.set(id);
    this.guardar();
  }

  restablecer(): void {
    this.clasica();
    this.guardar();
  }

  /** Sumi en su forma base: sin nada y con la bufanda índigo de SAESU. */
  private clasica(): void {
    this.sombrero.set('ninguno');
    this.cara.set('ninguno');
    this.objeto.set('ninguno');
    this.espalda.set('ninguno');
    this.fondo.set('ninguno');
    this.bufanda.set('saesu');
  }


  private guardar(): void {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(this.comoMapa()));
    } catch {
      // sin localStorage el estilo dura solo esta visita
    }
  }
}
