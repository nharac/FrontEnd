import { separar } from './saesu-snack-bar';

describe('separar (avisos con título y detalle)', () => {
  it('divide "Título: detalle" y pone mayúscula al detalle', () => {
    expect(separar('Pregunta creada: ya aparece en la práctica'))
      .toEqual({ titulo: 'Pregunta creada', mensaje: 'Ya aparece en la práctica' });
  });

  it('también divide con punto', () => {
    expect(separar('Publicación oculta. La encuentras en Moderación.'))
      .toEqual({ titulo: 'Publicación oculta', mensaje: 'La encuentras en Moderación.' });
  });

  it('deja igual los textos sin separador', () => {
    expect(separar('Guardado')).toEqual({ mensaje: 'Guardado' });
  });
});
