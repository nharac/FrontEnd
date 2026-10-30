import { Type, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { apiFalsa, peticiones, errores } from './api-falsa.testing';
import { errorInterceptor } from '../core/interceptors/error.interceptor';

/** Monta un componente con el backend falso y la ruta indicada. */
export async function montar<T>(componente: Type<T>, ruta: { params?: Record<string, string>; query?: Record<string, string>; data?: Record<string, unknown> } = {},
                                rol = 'ESTUDIANTE'): Promise<ComponentFixture<T>> {
  // jsdom no trae matchMedia; las pantallas lo usan para respetar "movimiento reducido"
  if (typeof globalThis.matchMedia !== 'function') {
    globalThis.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as unknown as typeof matchMedia;
  }
  localStorage.setItem('saesu_token', 'token-falso');
  localStorage.setItem('saesu_rol', rol);
  const snapshot = { paramMap: convertToParamMap(ruta.params ?? {}), queryParamMap: convertToParamMap(ruta.query ?? {}), data: ruta.data ?? {} };
  TestBed.configureTestingModule({
    imports: [componente],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      provideNoopAnimations(),
      provideHttpClient(withInterceptors([errorInterceptor, apiFalsa])),
      { provide: ActivatedRoute, useValue: { snapshot, paramMap: of(snapshot.paramMap), queryParamMap: of(snapshot.queryParamMap), params: of(ruta.params ?? {}), queryParams: of(ruta.query ?? {}), data: of(ruta.data ?? {}) } },
    ],
  });
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockResolvedValue(true);
  vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(componente);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

export function texto(f: ComponentFixture<unknown>): string {
  return (f.nativeElement as HTMLElement).textContent ?? '';
}

/** Deja que terminen las respuestas del backend falso y vuelve a pintar. */
export async function pintar(f: ComponentFixture<unknown>): Promise<void> {
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
}

export function limpiar(): void {
  peticiones.length = 0;
  errores.clear();
  localStorage.clear();
  sessionStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
}

export { peticiones, errores };
