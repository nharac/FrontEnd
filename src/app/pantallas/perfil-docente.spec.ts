import { afterEach, describe, expect, it } from 'vitest';
import { montar, pintar, limpiar, peticiones, errores } from './montar.testing';
import { PerfilDocente } from '../features/docente/pages/perfil-docente/perfil-docente';
import { PublicacionDetallePage } from '../features/docente/pages/publicacion-detalle/publicacion-detalle';
import { ListaPublicaciones } from '../features/foro/pages/lista-publicaciones/lista-publicaciones';

/* eslint-disable @typescript-eslint/no-explicit-any */
const archivo = (tipo: string, mb = 1) => ({ target: { files: [new File([new Uint8Array(mb * 1024 * 1024)], 'f', { type: tipo })], value: 'x' } }) as unknown as Event;

describe('Perfil del docente', () => {
  afterEach(limpiar);

  it('muestra la cuenta, cambia el nombre, la contraseña y la foto', async () => {
    const f = await montar(PerfilDocente, {}, 'DOCENTE');
    const c = f.componentInstance as any;
    await pintar(f);
    expect(c.nombre()).toBe('Ana Ruiz');
    expect(c.desde()).toContain('Docente desde');
    expect(f.nativeElement.textContent).toContain('Mis datos');

    expect(c.nombreCambio()).toBe(false);
    c.guardarNombre(); // sin cambios: no hace nada
    c.nombre.set('Ana María Ruiz');
    c.guardarNombre();
    await pintar(f);
    expect(peticiones.some(p => p.metodo === 'PUT' && p.url.endsWith('/auth/perfil'))).toBe(true);

    c.cambiarPassword(); // incompleto: no hace nada
    c.passwordActual.set('Vieja123!');
    c.passwordNueva.set('Nueva123!');
    c.confirmar.set('Otra');
    expect(c.puedeCambiarPassword()).toBe(false);
    c.confirmar.set('Nueva123!');
    c.cambiarPassword();
    await pintar(f);
    expect(c.passwordActual()).toBe('');

    errores.set(/auth\/perfil$/, 400);
    c.nombre.set('Otro Nombre');
    c.guardarNombre();
    errores.set(/auth\/perfil$/, 400);
    c.passwordActual.set('x'); c.passwordNueva.set('Nueva123!'); c.confirmar.set('Nueva123!');
    c.cambiarPassword();

    c.elegirFoto({ target: { files: [], value: '' } } as unknown as Event);
    c.elegirFoto(archivo('text/plain'));
    c.elegirFoto(archivo('image/png', 11));
    c.elegirFoto(archivo('image/png'));
    await pintar(f);
    errores.set(/perfil\/foto/, 500);
    c.elegirFoto(archivo('image/png'));
    await pintar(f);
    expect(peticiones.some(p => p.url.endsWith('/perfil/foto'))).toBe(true);
  });
});

describe('Eliminar publicaciones', () => {
  afterEach(limpiar);

  it('el docente elimina una publicación desde el detalle', async () => {
    const f = await montar(PublicacionDetallePage, { params: { id: '1' } }, 'DOCENTE');
    const c = f.componentInstance as any;
    await pintar(f);
    c.confirmandoEliminar.set(true);
    await pintar(f);
    expect(f.nativeElement.textContent).toContain('No se puede deshacer');
    errores.set(/foro\/publicaciones\/1$/, 500);
    c.eliminarPublicacion();
    await pintar(f);
    c.eliminarPublicacion();
    await pintar(f);
    expect(peticiones.filter(p => p.metodo === 'DELETE').length).toBe(2);
  });

  it('el estudiante elimina su publicación desde la lista del foro', async () => {
    const f = await montar(ListaPublicaciones);
    const c = f.componentInstance as any;
    await pintar(f);
    const mia = c.publicaciones()[0];
    expect(c.esMia(mia)).toBe(true);
    c.confirmandoId.set(mia.id);
    await pintar(f);
    expect(f.nativeElement.textContent).toContain('¿Eliminar tu publicación?');
    errores.set(/foro\/publicaciones\/\d+$/, 500);
    c.eliminar(mia);
    expect(c.publicaciones().length).toBe(3);
    c.eliminar(mia);
    await pintar(f);
    expect(c.publicaciones().some((p: any) => p.id === mia.id)).toBe(false);
  });
});

describe('Moderación: eliminar para siempre', () => {
  afterEach(limpiar);

  it('elimina publicaciones y respuestas ocultas', async () => {
    const { ModeracionDocente } = await import('../features/docente/pages/moderacion-docente/moderacion-docente');
    const f = await montar(ModeracionDocente, {}, 'DOCENTE');
    const c = f.componentInstance as any;
    await pintar(f);
    const antes = c.items().length;
    expect(antes).toBeGreaterThan(0);
    const primero = c.items()[0];
    c.confirmando.set(c.clave(primero));
    await pintar(f);
    expect(f.nativeElement.textContent).toContain('No se puede deshacer');
    errores.set(/docente\/(publicaciones|respuestas)\/\d+$/, 500);
    c.eliminar(primero);
    expect(c.items().length).toBe(antes);
    for (const i of [...c.items()]) c.eliminar(i);
    await pintar(f);
    expect(c.items().length).toBe(0);
    expect(peticiones.filter(p => p.metodo === 'DELETE' && /docente\/(publicaciones|respuestas)\/\d+$/.test(p.url)).length).toBe(antes + 1);
  });
});
