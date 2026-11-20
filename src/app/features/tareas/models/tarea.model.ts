/** Tarea asignada por el docente (vista del estudiante). */
export interface TareaEstudiante {
  id: number;
  titulo: string;
  instrucciones: string | null;
  tema: string;
  temaNombre: string;
  metaPreguntas: number;
  fechaLimite: string;
  docente: string;
  resueltas: number;
  completada: boolean;
  vencida: boolean;
  diasRestantes: number;
}

/** Tarea vista por el docente, con cuántos la completaron. */
export interface TareaDocente {
  id: number;
  titulo: string;
  instrucciones: string | null;
  tema: string;
  temaNombre: string;
  metaPreguntas: number;
  fechaLimite: string;
  estudianteId: number | null;
  asignadaA: string;
  asignados: number;
  completadas: number;
  vencida: boolean;
  creadaEn: string;
}

export interface TareaRequest {
  titulo: string;
  instrucciones: string | null;
  tema: string;
  metaPreguntas: number;
  fechaLimite: string;
  estudianteId: number | null;
}
