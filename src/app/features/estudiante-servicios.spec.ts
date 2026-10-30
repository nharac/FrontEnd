import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { QuizService } from './quiz/services/quiz.service';
import { PracticaService } from './practica/services/practica.service';
import { RankingService } from './gamificacion/services/ranking.service';
import { ForoService } from './foro/services/foro.service';

const API = environment.apiUrl;

describe('Servicios del estudiante', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('QuizService llama a iniciar, finalizar, resultado e historial', () => {
    const quiz = TestBed.inject(QuizService);
    quiz.iniciar({ tema: 'limites', cantidad: 10 } as never).subscribe();
    expect(backend.expectOne(`${API}/quiz/iniciar`).request.body).toEqual({ tema: 'limites', cantidad: 10 });
    quiz.finalizar(42, { respuestas: [] } as never).subscribe();
    expect(backend.expectOne(`${API}/quiz/42/finalizar`).request.method).toBe('POST');
    quiz.resultado(42).subscribe();
    backend.expectOne(`${API}/quiz/42`).flush({});
    quiz.historial().subscribe();
    backend.expectOne(`${API}/quiz/historial`).flush({});
  });

  it('PracticaService arma los filtros solo con lo que se elige', () => {
    const practica = TestBed.inject(PracticaService);
    practica.listarPreguntas().subscribe();
    const sinFiltros = backend.expectOne((r) => r.url === `${API}/practica/preguntas`);
    expect(sinFiltros.request.params.get('page')).toBe('0');
    expect(sinFiltros.request.params.get('size')).toBe('10');
    expect(sinFiltros.request.params.has('tema')).toBe(false);
    sinFiltros.flush([]);

    practica.listarPreguntas({ tema: 'derivadas', dificultad: 'basico', page: 2, size: 5 } as never).subscribe();
    const conFiltros = backend.expectOne((r) => r.url === `${API}/practica/preguntas`);
    expect(conFiltros.request.params.get('tema')).toBe('derivadas');
    expect(conFiltros.request.params.get('dificultad')).toBe('basico');
    conFiltros.flush([]);

    practica.responder(7, 3).subscribe();
    expect(backend.expectOne(`${API}/practica/preguntas/7/responder`).request.body).toEqual({ opcionId: 3 });
    practica.obtenerPista(7).subscribe();
    backend.expectOne(`${API}/practica/preguntas/7/pista`).flush({});
    practica.obtenerProgreso().subscribe();
    backend.expectOne(`${API}/practica/progreso`).flush({});
  });

  it('RankingService guarda el top histórico y calcula el puesto de cada usuario', () => {
    const ranking = TestBed.inject(RankingService);
    ranking.obtenerTop('semana').subscribe();
    backend.expectOne((r) => r.url === `${API}/ranking` && r.params.get('periodo') === 'semana').flush([{ usuarioId: 9 }]);
    expect(ranking.top()).toEqual([]); // la semana no cambia las medallas

    ranking.cargarTop();
    ranking.cargarTop(); // la segunda vez no repite la petición
    backend.expectOne((r) => r.url === `${API}/ranking` && r.params.get('periodo') === 'total')
      .flush([{ usuarioId: 5 }, { usuarioId: 1 }]);
    expect(ranking.lugarDe(1)).toBe(2);
    expect(ranking.lugarDe(77)).toBeNull();
    expect(ranking.lugarDe(null)).toBeNull();

    ranking.miPosicion('mes').subscribe();
    backend.expectOne((r) => r.url === `${API}/ranking/yo` && r.params.get('periodo') === 'mes').flush({});
  });

  it('ForoService limpia la búsqueda, comparte el perfil y sube la imagen como multipart', () => {
    const foro = TestBed.inject(ForoService);
    foro.listar({ busqueda: '  regla de la cadena  ', tema: 'derivadas' }).subscribe();
    const req = backend.expectOne((r) => r.url === `${API}/foro/publicaciones`);
    expect(req.request.params.get('busqueda')).toBe('regla de la cadena');
    expect(req.request.params.get('orden')).toBe('reciente');
    req.flush([]);

    foro.obtenerPerfil().subscribe();
    foro.obtenerPerfil().subscribe();
    backend.expectOne(`${API}/auth/perfil`).flush({ id: 1 }); // una sola petición para las dos

    foro.subirImagen(new File([new Uint8Array([1])], 'a.png', { type: 'image/png' })).subscribe();
    const img = backend.expectOne(`${API}/foro/imagenes`);
    expect(img.request.body instanceof FormData).toBe(true);
    img.flush({ url: 'https://s3/a.png' });

    foro.detalle(10).subscribe();
    backend.expectOne(`${API}/foro/publicaciones/10`).flush({});
    foro.responder(10, { contenido: 'Hola' } as never).subscribe();
    backend.expectOne(`${API}/foro/publicaciones/10/respuestas`).flush({});
    foro.eliminar(10).subscribe();
    expect(backend.expectOne(`${API}/foro/publicaciones/10`).request.method).toBe('DELETE');
  });
});
