import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Retos, iniciales } from './retos';
import { DuelosService } from '../../services/duelos.service';
import { Duelo } from '../../models/duelo.model';

const duelo = (o: Partial<Duelo>): Duelo => ({ id: 1, tema: 'algebra', temaNombre: 'Álgebra', rival: 'Beto Ruiz', soyRetador: false, modo: 'CLASICO', modoNombre: 'Clásico', puntajeMaximo: 5, limiteSegundos: null,
  estado: 'POR_JUGAR', resultado: null, misCorrectas: null, misSegundos: null, suyasCorrectas: null, suyosSegundos: null,
  totalPreguntas: 5, creadoEn: '', ...o });

describe('Retos', () => {
  function crear() {
    const s = {
      misDuelos: vi.fn(() => of([duelo({}), duelo({ id: 2, estado: 'TERMINADO', resultado: 'GANASTE', misCorrectas: 4, suyasCorrectas: 2 })])),
      companeros: vi.fn(() => of([{ id: 2, nombre: 'Beto Ruiz', fotoPerfilUrl: null }])),
      retar: vi.fn(() => of(duelo({ id: 3, soyRetador: true }))),
      preguntas: vi.fn(() => of([
        { id: 10, enunciado: '2+2', puntos: 1, opciones: [{ letra: 'A', texto: '4' }, { letra: 'B', texto: '5' }] },
        { id: 11, enunciado: '3+3', puntos: 3, opciones: [{ letra: 'A', texto: '6' }, { letra: 'B', texto: '7' }] }])),
      entregar: vi.fn(() => of(duelo({ id: 1, estado: 'TERMINADO', resultado: 'GANASTE', misCorrectas: 2, misSegundos: 30, suyasCorrectas: 1, suyosSegundos: 40 }))),
    };
    TestBed.configureTestingModule({ imports: [Retos], providers: [{ provide: DuelosService, useValue: s }] });
    const f = TestBed.createComponent(Retos);
    f.detectChanges();
    return { f, s };
  }

  it('iniciales del avatar', () => {
    expect(iniciales('Beto Ruiz Pérez')).toBe('BR');
    expect(iniciales('ana')).toBe('A');
  });

  it('muestra el récord, Sumi avisa del reto pendiente y se reta eligiendo rival y tema', () => {
    const { f, s } = crear();
    const c = f.componentInstance;
    expect(c.ganados()).toBe(1);
    expect(c.sumiPortada().titulo).toContain('reto esperando');
    expect(f.nativeElement.textContent).toContain('¡Ganaste!');
    c.rivalId.set(2);
    c.tema.set('limites');
    f.detectChanges();
    c.modo.set('MUERTE_SUBITA');
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('¡Retar a Beto · A muerte de Límites!');
    c.retar();
    expect(s.retar).toHaveBeenCalledWith(2, 'limites', 'MUERTE_SUBITA');
    expect(c.porJugar().length).toBe(2);
  });

  it('juega una pregunta a la vez, entrega y muestra el marcador con revancha', () => {
    const { f, s } = crear();
    const c = f.componentInstance;
    c.jugar(c.porJugar()[0]);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Reto contra Beto Ruiz');
    expect(c.preguntaActual()?.id).toBe(10);
    c.elegir(10, 'A');
    c.irA(1);
    c.elegir(11, 'B');
    expect(c.sumiJuego().estado).toBe('celebra');
    f.detectChanges();
    c.entregar();
    f.detectChanges();
    expect(s.entregar).toHaveBeenCalledWith(1, [{ preguntaId: 10, letra: 'A' }, { preguntaId: 11, letra: 'B' }], 0);
    expect(c.sumiFinal()?.titulo).toBe('¡GANASTE!');
    expect(f.nativeElement.textContent).toContain('Revancha');
    c.revancha(c.resultado()!);
    expect(s.retar).toHaveBeenCalledWith(2, 'algebra', 'CLASICO');
  });

  it('relámpago: cuenta hacia atrás y entrega solo al llegar a cero', () => {
    const { f, s } = crear();
    const c = f.componentInstance;
    s.preguntas.mockReturnValue(of([{ id: 10, enunciado: 'x', puntos: 1, opciones: [{ letra: 'A', texto: '1' }] }]));
    c.jugar(duelo({ id: 9, modo: 'RELAMPAGO', modoNombre: 'Relámpago', limiteSegundos: 60 }));
    expect(c.restantes()).toBe(60);
    c.segundos.set(50);
    expect(c.sumiJuego().titulo).toContain('Se acaba');
    c.segundos.set(59);
    c.tic();
    expect(s.entregar).toHaveBeenCalledWith(9, [{ preguntaId: 10, letra: null }], 60);
    expect(c.unidad('PUNTOS')).toBe('pts');
    expect(c.unidad('MUERTE_SUBITA')).toBe('racha');
    c.cancelar();
  });
});
