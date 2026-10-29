import {
  mensajeEstadisticas, mensajeEstudiantes, mensajeRanking, reaccionPractica,
  reaccionResultado, saludoDocente, saludoInicio,
} from './dialogos';

describe('Diálogos de Sumi', () => {
  describe('reaccionResultado', () => {
    it('celebra desde el 80 %', () => {
      expect(reaccionResultado(80)).toEqual({ estado: 'celebra', tono: 'exito' });
      expect(reaccionResultado(100).estado).toBe('celebra');
    });
    it('queda feliz entre 50 y 79 %', () => {
      expect(reaccionResultado(50)).toEqual({ estado: 'feliz', tono: 'normal' });
      expect(reaccionResultado(79).estado).toBe('feliz');
    });
    it('da ánimo por debajo de 50 %', () => {
      expect(reaccionResultado(49)).toEqual({ estado: 'animo', tono: 'alerta' });
      expect(reaccionResultado(0).tono).toBe('alerta');
    });
  });

  describe('reaccionPractica', () => {
    it('celebra el acierto al primer intento', () => {
      expect(reaccionPractica(true, 1, false).estado).toBe('celebra');
    });
    it('cuenta los intentos cuando acierta después', () => {
      expect(reaccionPractica(true, 3, true).texto).toContain('3 intentos');
    });
    it('invita a leer la pista si falló con pista', () => {
      expect(reaccionPractica(false, 1, true).estado).toBe('pensando');
    });
    it('sugiere pedir ayuda al segundo error', () => {
      expect(reaccionPractica(false, 2, false).titulo).toBe('No te rindas');
      expect(reaccionPractica(false, 1, false).titulo).toBe('Casi…');
    });
  });

  describe('saludoInicio', () => {
    it('celebra rachas de 3 días o más', () => {
      expect(saludoInicio(5, false)).toEqual({ titulo: '¡5 días seguidos! Así se hace', estado: 'celebra' });
    });
    it('usa singular con un día de racha', () => {
      expect(saludoInicio(1, false).titulo).toContain('1 día de racha');
    });
    it('sin racha da un consejo', () => {
      expect(saludoInicio(null, false).titulo).toBe('Un consejo para hoy');
    });
  });

  describe('mensajeRanking', () => {
    it('felicita al primero', () => {
      expect(mensajeRanking(1, null, null).estado).toBe('celebra');
    });
    it('dice cuántos puntos faltan en el podio', () => {
      expect(mensajeRanking(2, 15, 'Ana').texto).toBe('Te faltan 15 puntos para pasar a Ana.');
    });
    it('invita a practicar si aún no aparece', () => {
      expect(mensajeRanking(null, null, null).titulo).toBe('Todavía no apareces');
    });
  });

  describe('docente', () => {
    it('saluda con el primer nombre y cuenta las consultas pendientes', () => {
      const s = saludoDocente('Luiferney Ortiz', 2);
      expect(s.titulo).toBe('¡Hola, Luiferney!');
      expect(s.texto).toContain('2 consultas');
    });
    it('usa singular con una consulta', () => {
      expect(saludoDocente('', 1).texto).toContain('1 consulta sin');
    });
    it('resume el grupo sin riesgo y menciona a los nuevos', () => {
      const m = mensajeEstudiantes(0, 2);
      expect(m.tono).toBe('exito');
      expect(m.texto).toContain('2 son nuevos');
    });
    it('se pone nerviosa con más de 3 estudiantes en riesgo', () => {
      expect(mensajeEstudiantes(4, 0).estado).toBe('nervioso');
      expect(mensajeEstudiantes(1, 0).titulo).toBe('1 estudiante necesita atención');
    });
    it('señala el tema más bajo en las estadísticas', () => {
      expect(mensajeEstadisticas('integrales', 42)[0]).toContain('integrales (42 %)');
      expect(mensajeEstadisticas(null, null)).toHaveLength(2);
    });
  });
});
