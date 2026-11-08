/** Una regla de la contraseña y si ya se cumple. */
export interface ReglaPassword {
  texto: string;
  corto: string;
  ok: boolean;
}

/** Reglas de la contraseña (las mismas que valida el backend). */
export function reglasPassword(p: string): ReglaPassword[] {
  return [
    { texto: 'Mínimo 8 caracteres', corto: 'Mín. 8', ok: p.length >= 8 },
    { texto: 'Una mayúscula', corto: 'A-Z', ok: /[A-Z]/.test(p) },
    { texto: 'Una minúscula', corto: 'a-z', ok: /[a-z]/.test(p) },
    { texto: 'Un número', corto: '0-9', ok: /\d/.test(p) },
    { texto: 'Un carácter especial (@#$%^&+=!)', corto: 'Símbolo', ok: /[@#$%^&+=!]/.test(p) },
  ];
}
