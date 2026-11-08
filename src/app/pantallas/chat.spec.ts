import { afterEach, describe, expect, it, vi } from 'vitest';
import { montar, pintar, limpiar, peticiones, errores, texto } from './montar.testing';
import { ChatTutor } from '../features/chat/pages/chat-tutor/chat-tutor';

/* eslint-disable @typescript-eslint/no-explicit-any */
async function panel() {
  const f = await montar(ChatTutor);
  const p = f.debugElement.query(d => d.name === 'app-chat-panel').componentInstance as any;
  return { f, p };
}

describe('Chat con el tutor', () => {
  afterEach(limpiar);

  it('dibuja las fórmulas de la IA con KaTeX', async () => {
    const { f } = await panel();
    await pintar(f);
    // El historial falso trae "**Claro**"; se agrega una respuesta con fórmulas
    const p = f.debugElement.query(d => d.name === 'app-chat-panel').componentInstance as any;
    p.mensajes.update((l: unknown[]) => [...l, { id: 99, rolEmisor: 'ia', mensaje: 'Factoriza: $x^2 - 9 = (x-3)(x+3)$', preguntaId: null, fechaHora: '2026-11-04T10:00:00' }]);
    await pintar(f);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.tex.tex--lista .katex')).toBeTruthy();
    expect(texto(f)).toContain('Factoriza');
  });

  it('si la IA está saturada muestra a Sumi con un botón para reintentar', async () => {
    const { f, p } = await panel();
    p.texto.set('¿Cómo derivo x²?');
    errores.set(/chat\/mensaje/, 503);
    p.enviar();
    await pintar(f);
    expect(p.fallido()?.mensaje).toBe('¿Cómo derivo x²?');
    expect(texto(f)).toContain('Reintentar');
    expect(texto(f)).toContain('me enredé');

    p.reintentar();
    await pintar(f);
    expect(p.fallido()).toBeNull();
    expect(peticiones.filter(x => x.url.endsWith('/chat/mensaje'))).toHaveLength(2);
    p.reintentar(); // sin fallo pendiente no hace nada
  });

  it('el límite diario no se reintenta, solo avisa', async () => {
    const { f, p } = await panel();
    p.texto.set('Hola');
    errores.set(/chat\/mensaje/, 429);
    p.enviar();
    await pintar(f);
    expect(p.fallido()).toBeNull();
    expect(p.mensajesRestantes()).toBe(0);
  });

  it('mientras espera, Sumi va diciendo que está pensando', async () => {
    vi.useFakeTimers();
    const { p } = await panel();
    p.empezarEspera();
    expect(p.textoEspera()).toBe('');
    vi.advanceTimersByTime(6000);
    expect(p.textoEspera()).toContain('pensando');
    vi.advanceTimersByTime(10_000);
    expect(p.textoEspera()).toContain('poquito más');
    vi.advanceTimersByTime(15_000);
    expect(p.textoEspera()).toContain('Ya casi');
    p.terminarEspera();
    expect(p.segundosEsperando()).toBe(0);
    expect(p.motivoFallo(0)).toContain('conexión');
    expect(p.motivoFallo(504)).toContain('demoré');
  });
});
