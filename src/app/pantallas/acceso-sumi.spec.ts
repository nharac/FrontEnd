import { afterEach, describe, expect, it } from 'vitest';
import { montar, pintar, limpiar, errores } from './montar.testing';
import { RegistroForm } from '../features/usuario/pages/auth/registro-form/registro-form';
import { RecuperarPassword } from '../features/usuario/pages/recuperar-password/recuperar-password';
import { VerificarCorreo } from '../features/usuario/pages/verificar-correo/verificar-correo';

/* eslint-disable @typescript-eslint/no-explicit-any */
const pegado = (txt: string) => ({ preventDefault() {}, clipboardData: { getData: () => txt } }) as unknown as ClipboardEvent;

describe('Sumi guía las pantallas de acceso', () => {
  afterEach(limpiar);

  it('crear cuenta: Sumi da la indicación de cada campo', async () => {
    const f = await montar(RegistroForm);
    const c = f.componentInstance as any;
    expect(c.sumi().titulo).toBe('¡Hola! Soy Sumi');

    c.enfocar('nombre');
    expect(c.sumi().titulo).toBe('Tu nombre');

    c.enfocar('correo');
    c.registroForm.patchValue({ correo: 'ana@gmail.com' });
    expect(c.sumi().tono).toBe('info');
    c.registroForm.patchValue({ correo: 'ana@ucundinamarca.edu.co' });
    expect(c.sumi().titulo).toBe('¡Ese correo sirve!');

    c.enfocar('password');
    c.registroForm.patchValue({ password: 'clave' });
    expect(c.sumi().estado).toBe('pensando');
    await pintar(f);
    expect(f.nativeElement.querySelector('app-fuerza-password')).not.toBeNull();
    c.registroForm.patchValue({ password: 'Clave123!' });
    expect(c.sumi().titulo).toBe('¡Contraseña segura!');

    c.enfocar('confirmar');
    c.registroForm.patchValue({ confirmPassword: 'Otra' });
    expect(c.sumi().titulo).toBe('Repítela');
    c.registroForm.patchValue({ confirmPassword: 'Clave123!' });
    expect(c.sumi().titulo).toBe('¡Coinciden!');

    c.registroForm.patchValue({ nombre: 'Ana Ruiz' });
    expect(c.sumi().estado).toBe('celebra');
    expect(c.coinciden()).toBe(true);

    errores.set(/auth\/registro/, 400);
    c.onSubmit();
    await pintar(f);
    expect(c.sumi().estado).toBe('nervioso');
    c.enfocar('nombre');
    expect(c.errorServidor()).toBe('');
  });

  it('nueva contraseña: Sumi acompaña cada paso', async () => {
    const f = await montar(RecuperarPassword);
    const c = f.componentInstance as any;
    expect(c.sumi().accesorio).toBe('lupa');
    c.pedirCodigo();
    expect(c.sumi().estado).toBe('nervioso');
    c.correo.set('ana@ucundinamarca.edu.co');
    c.pedirCodigo();
    await pintar(f);
    expect(c.sumi().titulo).toBe('Te envié un código');
    c.pegar(pegado('482915'));
    await pintar(f);
    expect(c.paso()).toBe('password');
    expect(c.sumi().titulo).toBe('¡El código es correcto!');
    c.password.set('Nueva123!');
    c.campo.set('confirmar');
    expect(c.sumi().titulo).toBe('Repítela');
    c.confirmar.set('Nueva123!');
    expect(c.sumi().estado).toBe('celebra');
    c.cambiarPassword();
    await pintar(f);
    expect(c.paso()).toBe('listo');
    expect(c.sumi().accesorio).toBe('trofeo');
  });

  it('confirmar correo: Sumi explica y reacciona al error', async () => {
    const f = await montar(VerificarCorreo, { query: { correo: 'ana@ucundinamarca.edu.co' } });
    const c = f.componentInstance as any;
    expect(c.sumi().titulo).toBe('¡Ya casi!');
    c.error.set('Código incorrecto');
    expect(c.sumi().estado).toBe('nervioso');
    c.error.set('');
    c.digitos.set(['1', '2', '3', '4', '5', '6']);
    expect(c.sumi().estado).toBe('pensando');
  });
});

describe('Inicio del docente', () => {
  it('saluda según la hora y escribe la fecha en español', async () => {
    const { saludoPorHora, fechaLarga } = await import('../features/docente/pages/dashboard-docente/dashboard-docente');
    expect(saludoPorHora(8)).toBe('Buenos días');
    expect(saludoPorHora(15)).toBe('Buenas tardes');
    expect(saludoPorHora(21)).toBe('Buenas noches');
    expect(fechaLarga(new Date(2026, 10, 7))).toBe('sábado 7 de noviembre');
  });
});
