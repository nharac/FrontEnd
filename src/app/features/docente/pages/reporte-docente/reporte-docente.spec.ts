import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ReporteDocente } from './reporte-docente';
import { DocenteService } from '../../services/docente.service';

const resumen = (id: number, nombre: string, estado: 'nuevo' | 'al-dia' | 'en-riesgo') => ({ id, nombre, correo: 'x@u.edu.co', fotoPerfilUrl: null,
  puntos: 10, racha: 1, intentos: 20, correctas: 10, porcentaje: 50, ultimaActividad: null, enRiesgo: estado === 'en-riesgo',
  motivosRiesgo: estado === 'en-riesgo' ? ['No practica hace 9 días'] : [], porTema: [{ tema: 'limites', intentos: 10, correctas: 3, porcentaje: 30, resueltas: 3, totalPreguntas: 20 }],
  estado, diasDeGracia: null, quices: 1, promedioQuiz: 70 });

describe('ReporteDocente', () => {
  function crear(params: Record<string, string>) {
    const s = {
      obtenerPerfil: () => of({ nombre: 'Nhara Chaves' }),
      estadisticas: () => of({ totalEstudiantes: 2, activosSemana: 1, intentosSemana: 5, porcentajeAciertoGeneral: 61.5, estudiantesEnRiesgo: 1,
        preguntasActivas: 200, porTema: [{ tema: 'algebra_lineal', intentos: 4, correctas: 1, porcentaje: 25, estudiantes: 1, preguntasActivas: 40 }],
        preguntasDificiles: [{ id: 1, enunciado: 'Deriva x²', tema: 'derivadas', dificultad: 'basico', intentos: 5, fallos: 4, porcentajeFallo: 80, errorFrecuente: 'x' }], actividad: [] }),
      estudiantes: () => of([resumen(2, 'Zoe', 'al-dia'), resumen(1, 'Ana', 'en-riesgo')]),
      estudiante: () => of({ resumen: resumen(1, 'Ana', 'en-riesgo'), fechaRegistro: '2026-10-01', logrosObtenidos: 3, publicaciones: 1, respuestasForo: 2,
        respuestasOficiales: 0, ultimosIntentos: [], preguntasConMasFallos: [{ preguntaId: 8, enunciado: 'Integra', tema: 'integrales', fallos: 3, resuelta: false }],
        actividad: [], quices: [{ id: 9, tema: null, correctas: 4, total: 5, porcentaje: 80, duracionSegundos: 240, fueraDeTiempo: false, fecha: '2026-11-01' }] }),
    };
    TestBed.configureTestingModule({ imports: [ReporteDocente], providers: [provideRouter([]), { provide: DocenteService, useValue: s },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(params) } } }] });
    const f = TestBed.createComponent(ReporteDocente);
    f.detectChanges();
    return f;
  }

  it('reporte del grupo con estudiantes ordenados y los que hay que atender', () => {
    const f = crear({});
    const t: string = f.nativeElement.textContent;
    expect(t).toContain('Reporte del grupo');
    expect(t).toContain('Álgebra lineal');
    expect(t).toContain('Docente: Nhara Chaves');
    expect(t.indexOf('Ana')).toBeLessThan(t.indexOf('Zoe'));
    expect(t).toContain('Para atender');
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    f.componentInstance.imprimir();
    expect(print).toHaveBeenCalled();
  });

  it('reporte de un estudiante', () => {
    const f = crear({ estudiante: '1' });
    const t: string = f.nativeElement.textContent;
    expect(t).toContain('Reporte de Ana');
    expect(t).toContain('Motivos de riesgo');
    expect(t).toContain('Últimos quices');
    expect(t).toContain('Mixto');
  });
});
