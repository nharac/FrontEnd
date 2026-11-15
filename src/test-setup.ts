import { vi } from 'vitest';

// Algunas pantallas (perfil, vestidor de Sumi) montan muchos componentes y en equipos
// cargados tardan más de los 5 s por defecto de Vitest. 60 s evita falsos fallos por tiempo.
vi.setConfig({ testTimeout: 60_000 });
