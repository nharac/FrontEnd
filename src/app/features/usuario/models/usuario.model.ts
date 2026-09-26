import { Rol } from './rol.enum';


export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  fechaRegistro: string;
}