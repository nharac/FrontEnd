import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DocenteService } from './docente.service';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

describe('DocenteService', () => {
  let servicio: DocenteService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(DocenteService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('cuenta las consultas pendientes para la barra', () => {
    servicio.refrescarPendientes();
    backend.expectOne(`${API}/docente/notificaciones`).flush([{ id: 1 }, { id: 2 }]);
    expect(servicio.pendientes()).toBe(2);
  });

  it('si no hay conexión conserva el último conteo', () => {
    servicio.pendientes.set(4);
    servicio.refrescarPendientes();
    backend.expectOne(`${API}/docente/notificaciones`).error(new ProgressEvent('error'));
    expect(servicio.pendientes()).toBe(4);
  });

  it('cachea el perfil y lo limpia al cerrar sesión', () => {
    servicio.obtenerPerfil().subscribe();
    servicio.obtenerPerfil().subscribe();
    backend.expectOne(`${API}/auth/perfil`).flush({ id: 9 });
    servicio.limpiarCache();
    expect(servicio.pendientes()).toBeNull();
    servicio.obtenerPerfil().subscribe();
    backend.expectOne(`${API}/auth/perfil`).flush({ id: 9 });
  });

  it('seguimiento de estudiantes, quiz de un estudiante y descarga del Excel', () => {
    servicio.estudiantes().subscribe();
    backend.expectOne(`${API}/docente/estudiantes`).flush([]);
    servicio.estudiante(3).subscribe();
    backend.expectOne(`${API}/docente/estudiantes/3`).flush({});
    servicio.quizDeEstudiante(3, 42).subscribe();
    backend.expectOne(`${API}/docente/estudiantes/3/quices/42`).flush({});
    servicio.estadisticas().subscribe();
    backend.expectOne(`${API}/docente/estadisticas`).flush({});
    servicio.exportarEstudiantes().subscribe();
    const excel = backend.expectOne(`${API}/docente/estudiantes/exportar`);
    expect(excel.request.responseType).toBe('blob');
    excel.flush(new Blob(['x']));
  });

  it('respuesta oficial y banco de preguntas', () => {
    servicio.marcarOficial(50).subscribe();
    expect(backend.expectOne(`${API}/docente/respuestas/50/oficial`).request.method).toBe('POST');
    servicio.quitarOficial(50).subscribe();
    expect(backend.expectOne(`${API}/docente/respuestas/50/oficial`).request.method).toBe('DELETE');

    servicio.preguntas({ tema: 'limites', busqueda: '  límite  ' }).subscribe();
    const lista = backend.expectOne((r) => r.url === `${API}/docente/preguntas`);
    expect(lista.request.params.get('estado')).toBe('todas');
    expect(lista.request.params.get('busqueda')).toBe('límite');
    lista.flush([]);
    servicio.cambiarEstadoPregunta(7, false).subscribe();
    expect(backend.expectOne(`${API}/docente/preguntas/7/estado`).request.body).toEqual({ activa: false });
    servicio.listarPublicaciones({ tema: 'integrales' }).subscribe();
    const pubs = backend.expectOne((r) => r.url === `${API}/foro/publicaciones`);
    expect(pubs.request.params.get('size')).toBe('50');
    pubs.flush([]);
  });
});
