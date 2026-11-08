import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { montar, texto } from './montar.testing';
import { errores, peticiones } from './api-falsa.testing';
import { CalendarioActividad, nivelDe } from '../features/practica/components/calendario-actividad/calendario-actividad';
import { MetaSemanalCard } from '../features/practica/components/meta-semanal/meta-semanal';
import { AnalisisTemas, claseDe } from '../features/practica/components/analisis-temas/analisis-temas';

describe('Perfil: mi avance', () => {
  afterEach(() => { errores.clear(); peticiones.length = 0; TestBed.resetTestingModule(); });

  describe('Calendario de actividad', () => {
    it('pinta un cuadro por día, empieza en lunes y marca hoy', async () => {
      const f = await montar(CalendarioActividad);
      const c = f.componentInstance;
      // 2 de noviembre de 2026 es lunes: sin huecos
      expect(c.celdas().length).toBe(7);
      expect(c.celdas()[0]).not.toBeNull();
      expect(c.celdas()[6]!.hoy).toBe(true);
      expect(c.celdas().map(x => x!.nivel)).toEqual([0, 1, 0, 3, 4, 1, 2]);
      expect(c.meses()).toEqual([{ columna: 1, mes: 'nov' }]);
      expect(c.precision()).toBe(66);
      const t = texto(f);
      expect(t).toContain('5 días activos');
      expect(t).toContain('Tu mejor día: 6 de noviembre con 25 preguntas');
      expect(f.nativeElement.querySelector('.cal__rejilla').getAttribute('aria-label'))
        .toBe('5 días con práctica en la última semana, 47 preguntas respondidas');
      c.datos.set({ ...c.datos()!, dias: [...c.datos()!.dias, ...c.datos()!.dias.map(d => ({ ...d, fecha: d.fecha.replace('-11-0', '-11-1') }))] });
      expect(c.resumen()).toContain('las últimas 2 semanas');
    });

    it('al pasar por un día muestra su detalle', async () => {
      const f = await montar(CalendarioActividad);
      const celdas = f.nativeElement.querySelectorAll('.cal__rejilla .cal__celda');
      expect(celdas[4].getAttribute('title')).toBe('6 nov: 25 respondidas, 17 aciertos');
      expect(celdas[0].getAttribute('title')).toBe('2 nov: sin práctica');
      celdas[1].dispatchEvent(new Event('mouseenter'));
      f.detectChanges();
      expect(texto(f)).toContain('martes 3 de noviembre · 3 respondidas, 2 aciertos');
      expect(f.componentInstance.titulo({ fecha: '2026-11-03', respondidas: 1, aciertos: 1, nivel: 1, hoy: false }))
        .toBe('3 nov: 1 respondida, 1 acierto');
    });

    it('niveles de color y error', async () => {
      expect([0, 1, 4, 5, 9, 10, 19, 20, 99].map(nivelDe)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
      errores.set(/practica\/actividad/, 500);
      const f = await montar(CalendarioActividad);
      expect(texto(f)).toContain('No se pudo cargar tu actividad');
    });
  });

  describe('Meta semanal', () => {
    let f: ComponentFixture<MetaSemanalCard>;

    it('muestra el avance y lo que opina Sumi del ritmo', async () => {
      f = await montar(MetaSemanalCard);
      const c = f.componentInstance;
      expect(c.avancePct()).toBe(60);
      expect(c.faltan()).toBe(8);
      expect(texto(f)).toContain('Te faltan 8 preguntas');
      expect(texto(f)).toContain('Quedan 5 días');
      // Miércoles: se esperaban 20 * 3/7 ≈ 8.6 y lleva 12 → buen ritmo; 8 en 5 días = 2 al día
      expect(c.mensaje()).toEqual({ estado: 'feliz', texto: '¡Vas a buen ritmo! Te faltan 8, unas 2 al día.' });

      c.datos.set({ ...c.datos()!, respondidas: 2 });
      expect(c.mensaje().estado).toBe('animo');
      expect(c.mensaje().texto).toContain('4 preguntas al día');
      c.datos.set({ ...c.datos()!, respondidas: 0, diasRestantes: 1 });
      expect(c.mensaje().estado).toBe('saludo');
      expect(c.mensaje().texto).toContain('20 preguntas al día');
    });

    it('cambiar la meta con una sugerida o con otra cantidad', async () => {
      f = await montar(MetaSemanalCard);
      const snack = vi.spyOn(TestBed.inject(MatSnackBar), 'open');
      (f.nativeElement.querySelector('.meta__editar') as HTMLButtonElement).click();
      f.detectChanges();
      expect(texto(f)).toContain('¿Cuántas preguntas quieres responder por semana?');

      const opciones = Array.from(f.nativeElement.querySelectorAll('.meta__opcion')) as HTMLButtonElement[];
      opciones.find(b => b.textContent?.trim() === '10')!.click();
      await f.whenStable();
      f.detectChanges();
      expect(peticiones.at(-1)).toMatchObject({ metodo: 'PUT', cuerpo: { meta: 10 } });
      expect(f.componentInstance.editando()).toBe(false);
      expect(texto(f)).toContain('¡Cumplida!');
      expect(f.componentInstance.mensaje().estado).toBe('celebra');

      f.componentInstance.guardar(3);
      f.componentInstance.guardar(null);
      expect(snack).toHaveBeenCalledWith('La meta debe estar entre 5 y 300 preguntas', 'Cerrar', expect.anything());

      errores.set(/practica\/meta$/, 500);
      f.componentInstance.guardar(40);
      await f.whenStable();
      expect(f.componentInstance.guardando()).toBe(false);
    });

    it('error al cargar', async () => {
      errores.set(/practica\/meta$/, 500);
      f = await montar(MetaSemanalCard);
      expect(texto(f)).toContain('No se pudo cargar tu meta');
    });
  });

  describe('Fortalezas y debilidades', () => {
    it('mapa de calor, listas y recomendación con enlace a práctica', async () => {
      const f = await montar(AnalisisTemas);
      const celdas = Array.from(f.nativeElement.querySelectorAll('.an__celda')) as HTMLElement[];
      expect(celdas.length).toBe(9);
      expect(celdas[0].className).toContain('an__celda--fuerte');
      expect(celdas[1].className).toContain('an__celda--regular');
      expect(celdas[2].className).toContain('an__celda--sin-datos');
      expect(celdas[5].className).toContain('an__celda--debil');
      expect(celdas[0].getAttribute('aria-label')).toBe('Límites · Básico: 90% de acierto en 10 preguntas');
      expect(celdas[2].getAttribute('aria-label')).toBe('Límites · Avanzado: sin respuestas');
      const t = texto(f);
      expect(t).toContain('Tus fortalezas');
      expect(t).toContain('Derivadas · Avanzado');
      expect(t).toContain('Sumi te recomienda');
      const enlace = f.nativeElement.querySelector('.an__recomendacion a') as HTMLAnchorElement;
      expect(enlace.getAttribute('href')).toBe('/practica?tema=derivadas&dificultad=avanzado');
    });

    it('sin respuestas invita a practicar; y error', async () => {
      const f = await montar(AnalisisTemas);
      f.componentInstance.datos.set({ ...f.componentInstance.datos()!, detalle: f.componentInstance.datos()!.detalle.map(r => ({ ...r, respondidas: 0 })) });
      f.detectChanges();
      expect(texto(f)).toContain('Cuando respondas algunas preguntas');
      TestBed.resetTestingModule();
      errores.set(/practica\/analisis$/, 500);
      const g = await montar(AnalisisTemas);
      expect(texto(g)).toContain('No se pudo cargar el análisis');
    });

    it('claseDe usa los mismos umbrales del backend', () => {
      const r = (respondidas: number, porcentaje: number) => ({ tema: 'limites' as const, dificultad: 'basico' as const, respondidas, correctas: 0, porcentaje });
      expect([r(2, 100), r(3, 70), r(3, 69), r(3, 60), r(3, 59)].map(claseDe)).toEqual(['sin-datos', 'fuerte', 'regular', 'regular', 'debil']);
    });
  });
});
