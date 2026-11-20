import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Retos } from './retos';
import { DuelosService } from '../../services/duelos.service';
import { Duelo } from '../../models/duelo.model';

const duelo = (o: Partial<Duelo>): Duelo => ({ id: 1, tema: 'algebra', temaNombre: 'Álgebra', rival: 'Beto', soyRetador: false,
  estado: 'POR_JUGAR', resultado: null, misCorrectas: null, misSegundos: null, suyasCorrectas: null, suyosSegundos: null,
  totalPreguntas: 5, creadoEn: '', ...o });

describe('Retos', () => {
  function crear() {
    const s = {
      misDuelos: vi.fn(() => of([duelo({}), duelo({ id: 2, estado: 'TERMINADO', resultado: 'GANASTE', misCorrectas: 4, suyasCorrectas: 2 })])),
      companeros: vi.fn(() => of([{ id: 2, nombre: 'Beto', fotoPerfilUrl: null }])),
      retar: vi.fn(() => of(duelo({ id: 3, soyRetador: true }))),
      preguntas: vi.fn(() => of([{ id: 10, enunciado: '2+2', opciones: [{ letra: 'A', texto: '4' }, { letra: 'B', texto: '5' }] }])),
      entregar: vi.fn(() => of(duelo({ id: 1, estado: 'ESPERANDO', misCorrectas: 1, misSegundos: 0 }))),
    };
    TestBed.configureTestingModule({ imports: [Retos], providers: [{ provide: DuelosService, useValue: s }] });
    const f = TestBed.createComponent(Retos);
    f.detectChanges();
    return { f, s };
  }

  it('separa pendientes e historial y reta a un compañero', () => {
    const { f, s } = crear();
    const c = f.componentInstance;
    expect(c.porJugar().length).toBe(1);
    expect(c.ganados()).toBe(1);
    expect(f.nativeElement.textContent).toContain('¡Ganaste!');
    c.rivalId.set(2);
    c.tema.set('limites');
    c.retar();
    expect(s.retar).toHaveBeenCalledWith(2, 'limites');
    expect(c.porJugar().length).toBe(2);
  });

  it('juega y entrega las respuestas', () => {
    const { f, s } = crear();
    const c = f.componentInstance;
    c.jugar(c.porJugar()[0]);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Reto contra Beto');
    c.elegir(10, 'A');
    expect(c.contestadas()).toBe(1);
    c.entregar();
    f.detectChanges();
    expect(s.entregar).toHaveBeenCalledWith(1, [{ preguntaId: 10, letra: 'A' }], 0);
    expect(c.jugando()).toBeNull();
    expect(f.nativeElement.textContent).toContain('Cuando Beto juegue');
    expect(c.textoResultado(duelo({ estado: 'ESPERANDO' }))).toBe('Esperando a Beto');
  });
});
