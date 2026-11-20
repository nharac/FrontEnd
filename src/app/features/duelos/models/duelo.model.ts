export type EstadoDuelo = 'POR_JUGAR' | 'ESPERANDO' | 'TERMINADO';

export interface Duelo {
  id: number;
  tema: string;
  temaNombre: string;
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
  opciones: { letra: string; texto: string }[];
}
