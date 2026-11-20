import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Vivo } from './vivo';
import { VivoService } from '../../services/duelos.service';
import { EstadoSala } from '../../models/duelo.model';

const base = (o: Partial<EstadoSala>): EstadoSala => ({ codigo: 'ABC123', tema: 'algebra', temaNombre: 'Álgebra', estado: 'JUGANDO', soyAnfitrion: true,
  abierta: false, rival: 'Beto', cuentaRegresiva: null, indice: 0, total: 5, segundosPorPregunta: 20, segundosRestantes: 15,
  pregunta: { orden: 0, id: 1, enunciado: '2+2', opciones: [{ letra: 'A', texto: '4' }, { letra: 'B', texto: '5' }] }, miRespuesta: null,
  jugadores: [{ nombre: 'Ana', soyYo: true, puntos: 0, aciertos: 0, respondioActual: false }, { nombre: 'Beto Ruiz', soyYo: false, puntos: 130, aciertos: 1, respondioActual: true }],
  resultado: null, ...o });

describe('Vivo', () => {
  function crear(estado: EstadoSala) {
    const s = { ver: vi.fn(() => of(estado)), unirse: vi.fn(() => of(base({}))), responder: vi.fn(() => of({ letra: 'A', correcta: true, letraCorrecta: 'A', puntos: 138 })), cancelar: vi.fn(() => of(base({ estado: 'CANCELADA' }))) };
    TestBed.configureTestingModule({ imports: [Vivo], providers: [provideRouter([]), { provide: VivoService, useValue: s },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ codigo: 'abc123' }) } } }] });
    const f = TestBed.createComponent(Vivo);
    f.detectChanges();
    return { f, s };
  }


  it('muestra el marcador en vivo y responde con puntos', () => {
    const { f, s } = crear(base({}));
    const c = f.componentInstance;
    expect(s.ver).toHaveBeenCalledWith('ABC123');
    expect(f.nativeElement.textContent).toContain('130');
    expect(f.nativeElement.textContent).toContain('✓ respondió');
    expect(c.progresoTiempo()).toBe(75);
    c.responder('A');
    f.detectChanges();
    expect(s.responder).toHaveBeenCalledWith('ABC123', 0, 'A');
    expect(c.sumi().titulo).toBe('¡Correcto! +138');
    expect(c.claseOpcion('A')).toBe('vv-opcion--correcta');
    expect(c.claseOpcion('B')).toBe('vv-opcion--apagada');
    c.responder('B'); // ya respondió: no envía otra vez
    expect(s.responder).toHaveBeenCalledTimes(1);
    // cambia la pregunta: se limpia la respuesta
    c.aplicar(base({ indice: 1, pregunta: { orden: 1, id: 2, enunciado: 'x', opciones: [] } }));
    expect(c.mia()).toBeNull();
    c.ngOnDestroy();
  });

  it('el invitado entra y al terminar se para de consultar', () => {
    const { f, s } = crear(base({ estado: 'ESPERANDO', soyAnfitrion: false, pregunta: null, jugadores: [{ nombre: 'Ana', soyYo: false, puntos: 0, aciertos: 0, respondioActual: false }] }));
    const c = f.componentInstance;
    expect(c.puedoUnirme()).toBe(true);
    expect(f.nativeElement.textContent).toContain('Entrar al reto');
    c.unirme();
    expect(s.unirse).toHaveBeenCalledWith('ABC123');
    c.aplicar(base({ estado: 'TERMINADA', resultado: 'GANASTE', pregunta: null }));
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('¡Ganaste!');
    expect(c.sumi().estado).toBe('celebra');
    c.ngOnDestroy();
  });
});
