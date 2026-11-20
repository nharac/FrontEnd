export type ModoDuelo = 'CLASICO' | 'MUERTE_SUBITA' | 'PUNTOS' | 'RELAMPAGO';

export interface InfoModo { id: ModoDuelo; nombre: string; icono: string; descripcion: string; preguntas: number }

export const MODOS: InfoModo[] = [
  { id: 'CLASICO', nombre: 'Clásico', icono: 'sports_kabaddi', descripcion: '5 preguntas. Gana quien acierte más.', preguntas: 5 },
  { id: 'MUERTE_SUBITA', nombre: 'A muerte', icono: 'skull', descripcion: '10 preguntas. Cuenta tu racha hasta el primer error.', preguntas: 10 },
  { id: 'PUNTOS', nombre: 'A puntos', icono: 'stars', descripcion: '8 preguntas. Básica 1, intermedia 2 y avanzada 3 puntos.', preguntas: 8 },
  { id: 'RELAMPAGO', nombre: 'Relámpago', icono: 'bolt', descripcion: '10 preguntas en 60 segundos. ¡Rápido!', preguntas: 10 },
];

export type EstadoDuelo = 'POR_JUGAR' | 'ESPERANDO' | 'TERMINADO';

export interface Duelo {
  id: number;
  tema: string;
  temaNombre: string;
  modo: ModoDuelo;
  modoNombre: string;
  puntajeMaximo: number;
  limiteSegundos: number | null;
  rival: string;
  soyRetador: boolean;
  estado: EstadoDuelo;
  resultado: 'GANASTE' | 'PERDISTE' | 'EMPATE' | null;
  misCorrectas: number | null;
  misSegundos: number | null;
  suyasCorrectas: number | null;
  suyosSegundos: number | null;
  totalPreguntas: number;
  creadoEn: string;
}

export interface Companero {
  id: number;
  nombre: string;
  fotoPerfilUrl: string | null;
}

export interface PreguntaDuelo {
  id: number;
  enunciado: string;
  puntos: number;
  opciones: { letra: string; texto: string }[];
}

export interface FilaTorneo {
  posicion: number;
  usuarioId: number;
  nombre: string;
  jugados: number;
  ganados: number;
  empates: number;
  perdidos: number;
  puntos: number;
  soyYo: boolean;
}

export interface Torneo {
  inicio: string;
  fin: string;
  diasRestantes: number;
  tabla: FilaTorneo[];
  campeonAnterior: FilaTorneo | null;
}
