import { afterEach, describe, expect, it } from 'vitest';
import { montar, pintar, limpiar } from './montar.testing';

import { Verificado } from '../shared/components/verificado/verificado';
import { VerPublicacion } from '../features/foro/pages/ver-publicacion/ver-publicacion';
import { PerfilDocente } from '../features/docente/pages/perfil-docente/perfil-docente';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('Chulito de docente verificado', () => {
  afterEach(() => limpiar());

  it('se dibuja accesible y con el tamaño pedido', async () => {
    const f = await montar(Verificado);
    f.componentRef.setInput('tam', 22);
    await pintar(f);
    const el = f.nativeElement as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Docente verificado');
    expect(el.getAttribute('title')).toContain('verificado');
    expect(el.style.getPropertyValue('--tam')).toBe('22px');
    expect(el.querySelector('svg polygon')).not.toBeNull();
  });

  it('foro: solo los docentes llevan el chulito', async () => {
    const f = await montar(VerPublicacion, { params: { id: '1' } });
    const c = f.componentInstance as any;
    await pintar(f);
    expect(f.nativeElement.querySelectorAll('app-verificado').length).toBe(0);
    c.publicacion.update((p: any) => ({
      ...p, autor: { ...p.autor, rol: 'DOCENTE' },
      respuestas: [{ ...p.respuestas[0], autor: { ...p.respuestas[0].autor, rol: 'DOCENTE' } }, ...p.respuestas.slice(1)]
    }));
    await pintar(f);
    expect(f.nativeElement.querySelectorAll('app-verificado').length).toBe(2);
  });

  it('perfil del docente: chulito junto al nombre', async () => {
    const f = await montar(PerfilDocente, {}, 'DOCENTE');
    await pintar(f);
    expect(f.nativeElement.querySelector('h1 app-verificado')).not.toBeNull();
  });
});
