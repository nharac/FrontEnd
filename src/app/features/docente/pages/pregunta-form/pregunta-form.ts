import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DocenteService } from '../../services/docente.service';
import { Dificultad, LETRAS, Letra, NOMBRES_DIFICULTAD, PreguntaDocenteRequest } from '../../models/docente.model';
import { NOMBRES_TEMA, TemaForo } from '../../../foro/models/foro.model';

/**
 * /docente/preguntas/nueva  y  /docente/preguntas/:id
 * Formulario para crear o editar una pregunta, con vista previa de cómo la verá el estudiante.
 * Las validaciones son las mismas del backend (BancoPreguntasService).
 */
@Component({
  selector: 'app-pregunta-form',
  imports: [RouterLink, FormsModule, MatIconModule],
  templateUrl: './pregunta-form.html',
  styleUrl: './pregunta-form.scss',
})
export class PreguntaForm implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private docenteService = inject(DocenteService);
  private snackBar = inject(MatSnackBar);

  readonly letras = LETRAS;
  readonly nombresTema = NOMBRES_TEMA;
  readonly nombresDificultad = NOMBRES_DIFICULTAD;

  id = signal<number | null>(null);
  cargando = signal(false);
  guardando = signal(false);
  intentos = signal(0);
  activa = signal(true);
  intentoEnviar = signal(false);
  errorServidor = signal('');

  tema = signal<TemaForo>('limites');
  dificultad = signal<Dificultad>('basico');
  enunciado = signal('');
  pista = signal('');
  textos = signal<Record<Letra, string>>({ A: '', B: '', C: '', D: '' });
  correcta = signal<Letra | null>(null);

  /** Errores del formulario (se muestran después del primer intento de guardar). */
  errores = computed(() => {
    const e: string[] = [];
    if (!this.enunciado().trim()) e.push('Escribe el enunciado.');
    if (this.enunciado().length > 2000) e.push('El enunciado no puede superar 2000 caracteres.');
    const textos = LETRAS.map(l => this.textos()[l].trim());
    if (textos.some(t => !t)) e.push('Completa las 4 opciones.');
    if (new Set(textos.filter(Boolean).map(t => t.toLowerCase())).size < textos.filter(Boolean).length) {
      e.push('Las opciones deben ser diferentes.');
    }
    if (!this.correcta()) e.push('Marca cuál opción es la correcta.');
    if (this.pista().length > 1000) e.push('La pista no puede superar 1000 caracteres.');
    return e;
  });

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param && param !== 'nueva') {
      this.id.set(Number(param));
      this.cargando.set(true);
      this.docenteService.pregunta(Number(param)).subscribe({
        next: (p) => {
          this.tema.set(p.tema);
          this.dificultad.set(p.dificultad);
          this.enunciado.set(p.enunciado);
          this.pista.set(p.pista ?? '');
          const textos = { A: '', B: '', C: '', D: '' } as Record<Letra, string>;
          p.opciones.forEach(o => textos[o.letra] = o.texto);
          this.textos.set(textos);
          this.correcta.set(p.opciones.find(o => o.esCorrecta)?.letra ?? null);
          this.intentos.set(p.intentos);
          this.activa.set(p.activa);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.snackBar.open('No se encontró la pregunta', 'Cerrar', { duration: 3000 });
          void this.router.navigate(['/docente/preguntas']);
        }
      });
    }
  }

  cambiarTexto(letra: Letra, valor: string): void {
    this.textos.update(t => ({ ...t, [letra]: valor }));
  }

  guardar(): void {
    this.intentoEnviar.set(true);
    this.errorServidor.set('');
    if (this.errores().length || this.guardando()) {
      return;
    }
    const request: PreguntaDocenteRequest = {
      tema: this.tema(),
      dificultad: this.dificultad(),
      enunciado: this.enunciado().trim(),
      pista: this.pista().trim() || null,
      opciones: LETRAS.map(letra => ({ letra, texto: this.textos()[letra].trim(), esCorrecta: this.correcta() === letra }))
    };
    this.guardando.set(true);
    const id = this.id();
    const peticion = id ? this.docenteService.actualizarPregunta(id, request) : this.docenteService.crearPregunta(request);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.snackBar.open(id ? 'Pregunta actualizada' : 'Pregunta creada: ya aparece en la práctica', 'Cerrar', { duration: 3500 });
        void this.router.navigate(['/docente/preguntas']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorServidor.set(err?.message || 'No se pudo guardar la pregunta');
      }
    });
  }
}
