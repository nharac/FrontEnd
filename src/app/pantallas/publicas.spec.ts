import { afterEach, describe, expect, it } from 'vitest';
import { montar, limpiar } from './montar.testing';
import { Auth } from '../features/usuario/pages/auth/auth';
import { RecuperarPassword } from '../features/usuario/pages/recuperar-password/recuperar-password';
import { VerificarCorreo } from '../features/usuario/pages/verificar-correo/verificar-correo';

describe('Pantallas públicas', () => {
  afterEach(limpiar);
  it('login y registro', async () => {
    const f = await montar(Auth);
    expect(f.componentInstance).toBeTruthy();
  });
  it('recuperar contraseña', async () => {
    const f = await montar(RecuperarPassword);
    expect(f.componentInstance).toBeTruthy();
  });
  it('verificar correo', async () => {
    const f = await montar(VerificarCorreo, { query: { correo: 'ana@ucundinamarca.edu.co' } });
    expect(f.componentInstance).toBeTruthy();
  });
});
