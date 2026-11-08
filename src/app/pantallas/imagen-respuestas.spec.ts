import { By } from '@angular/platform-browser';
import { afterEach, describe, expect, it } from 'vitest';
import { montar, pintar, limpiar, peticiones, errores } from './montar.testing';

import { AdjuntarImagen } from '../shared/components/adjuntar-imagen/adjuntar-imagen';
import { RespuestaItem } from '../shared/components/respuesta-item/respuesta-item';
import { VerPublicacion } from '../features/foro/pages/ver-publicacion/ver-publicacion';
import { PublicacionDetallePage } from '../features/docente/pages/publicacion-detalle/publicacion-detalle';

/* eslint-disable @typescript-eslint/no-explicit-any */
const foto = (tipo = 'image/png', bytes = 10) => new File([new Uint8Array(bytes)], 'f.png', { type: tipo });
const elegir = (c: any, archivo: File | null) => c.elegir({ target: { files: archivo ? [archivo] : [], value: 'x' } });

describe('Imágenes en las respuestas del foro', () => {
  afterEach(() => limpiar());

  it('adjuntar: valida tipo y tamaño y muestra la vista previa', async () => {
    (URL as any).createObjectURL ??= () => 'blob:x';
    (URL as any).revokeObjectURL ??= () => undefined;
    const f = await montar(AdjuntarImagen);
    const c = f.componentInstance as any;
    elegir(c, null);
    elegir(c, foto('application/pdf'));
    elegir(c, foto('image/png', 6 * 1024 * 1024));
    expect(c.archivo()).toBeNull();
    elegir(c, foto());
    await pintar(f);
    expect(c.archivo()).not.toBeNull();
    expect(f.nativeElement.querySelector('.adj__vista img')).not.toBeNull();
    (f.nativeElement.querySelector('.adj__vista button') as HTMLButtonElement).click();
    await pintar(f);
    expect(c.archivo()).toBeNull();
    expect(f.nativeElement.querySelector('.adj__boton')).not.toBeNull();
    f.destroy();
  });

  it('estudiante: sube la foto y la envía con la respuesta', async () => {
    const f = await montar(VerPublicacion, { params: { id: '1' } });
    const c = f.componentInstance as any;
    await pintar(f);
    c.archivo.set(foto());
    c.responder('Mira mi procedimiento', null, c.archivo());
    await pintar(f);
    const r = peticiones.find(p => p.metodo === 'POST' && /publicaciones\/1\/respuestas$/.test(p.url));
    expect(peticiones.some(p => /foro\/imagenes$/.test(p.url))).toBe(true);
    expect((r?.cuerpo as any).imagenUrl).toBe('https://img/1.png');
    expect(c.archivo()).toBeNull();
  });

  it('estudiante: sin foto envía imagenUrl nulo y avisa si falla la subida', async () => {
    const f = await montar(VerPublicacion, { params: { id: '1' } });
    const c = f.componentInstance as any;
    await pintar(f);
    c.responder('Sin foto');
    await pintar(f);
    const r = peticiones.find(p => p.metodo === 'POST' && /respuestas$/.test(p.url));
    expect((r?.cuerpo as any).imagenUrl).toBeNull();
    errores.set(/foro\/imagenes$/, 500);
    c.responder('Con foto rota', null, foto());
    await pintar(f);
    expect(c.enviando()).toBe(false);
  });

  it('docente: también puede adjuntar una foto al responder', async () => {
    const f = await montar(PublicacionDetallePage, { params: { id: '1' } }, 'DOCENTE');
    const c = f.componentInstance as any;
    await pintar(f);
    c.archivo.set(foto());
    c.responder('Revisa el paso 2', null, c.archivo());
    await pintar(f);
    expect(peticiones.some(p => /foro\/imagenes$/.test(p.url))).toBe(true);
    const r = peticiones.find(p => p.metodo === 'POST' && /respuestas$/.test(p.url));
    expect((r?.cuerpo as any).imagenUrl).toBe('https://img/1.png');
  });

  it('respuesta: muestra la imagen y envía la foto en la respuesta anidada', async () => {
    const f = await montar(VerPublicacion, { params: { id: '1' } });
    const c = f.componentInstance as any;
    await pintar(f);
    c.publicacion.update((p: any) => ({ ...p, respuestas: [{ ...p.respuestas[0], imagenUrl: 'https://img/5.png' }, ...p.respuestas.slice(1)] }));
    await pintar(f);
    expect(f.nativeElement.querySelector('.respuesta__imagen img')?.getAttribute('src')).toBe('https://img/5.png');
    const item = f.debugElement.query(By.directive(RespuestaItem)).componentInstance as any;
    item.texto.set('Gracias');
    item.archivo.set(foto());
    item.enviarRespuesta();
    expect(item.archivo()).toBeNull();
    await pintar(f);
    const r = peticiones.find(p => p.metodo === 'POST' && /respuestas$/.test(p.url));
    expect((r?.cuerpo as any).imagenUrl).toBe('https://img/1.png');
    expect((r?.cuerpo as any).respuestaPadreId).not.toBeNull();
  });
});
