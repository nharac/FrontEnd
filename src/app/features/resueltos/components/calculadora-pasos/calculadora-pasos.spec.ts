import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { CalculadoraPasos } from './calculadora-pasos';
import { ChatService } from '../../../chat/services/chat.service';

describe('Calculadora paso a paso', () => {
  function crear(chat: object) {
    TestBed.configureTestingModule({ imports: [CalculadoraPasos], providers: [{ provide: ChatService, useValue: chat }] });
    const f = TestBed.createComponent(CalculadoraPasos);
    f.detectChanges();
    return f;
  }

  it('envía el ejercicio y muestra la explicación', () => {
    const chat = { explicar: vi.fn().mockReturnValue(of({ explicacion: 'Paso 1: factorizar\nRespuesta: x = 2', mensajesRestantes: 9 })) };
    const f = crear(chat);
    const c = f.componentInstance;
    c.resolver(); // vacío: no hace nada
    expect(chat.explicar).not.toHaveBeenCalled();
    c.usarEjemplo(c.ejemplos[0]);
    c.resolver();
    f.detectChanges();
    expect(chat.explicar).toHaveBeenCalledWith('Resuelve 2x² − 8 = 0');
    expect(f.nativeElement.textContent).toContain('Respuesta: x = 2');
    expect(f.nativeElement.textContent).toContain('Te quedan 9 mensajes');
  });

  it('muestra el mensaje del servidor si falla', () => {
    const chat = { explicar: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 429, error: { mensaje: 'Límite diario' } }))) };
    const f = crear(chat);
    f.componentInstance.ejercicio.set('x + 1 = 2');
    f.componentInstance.resolver();
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Límite diario');
  });
});
