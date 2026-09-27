
# Contrato de API — SAESU

**Sistema de Apoyo al Estudio de Sistemas Universitarios**
Universidad de Cundinamarca — Ingeniería de Sistemas

Este documento define el **acuerdo entre frontend y backend** para el proyecto SAESU. Todo endpoint debe respetar **exactamente** lo aquí escrito. Si algo cambia, se avisa y se actualiza este archivo **antes** de tocar el código.

**Versión:** 1.0 · **Última actualización:** 26/09/2026

---

## Índice

1. [Convenciones generales](#convenciones-generales)
2. [Códigos HTTP](#códigos-http)
3. [Formato de error estándar](#formato-de-error-estándar)
4. [JWT](#jwt)
5. [Módulo Autenticación](#módulo-autenticación)
6. [Módulo Usuario](#módulo-usuario)
7. [Módulo Práctica](#módulo-práctica)
8. [Módulo Chat IA](#módulo-chat-ia)
9. [Módulo Foro](#módulo-foro)
10. [Módulo Docente](#módulo-docente)
11. [Modelos compartidos](#modelos-compartidos)
12. [Reglas de convivencia](#reglas-de-convivencia)

---

##  Convenciones generales

| Aspecto | Valor |
|---|---|
| **Base URL (desarrollo)** | `http://localhost:8080/api` |
| **Base URL (producción)** | `https://saesu-backend.azurewebsites.net/api` |
| **Formato** | JSON (`Content-Type: application/json`) |
| **Charset** | UTF-8 |
| **Autenticación** | JWT en header `Authorization: Bearer <token>` |
| **Expiración del token** | 24 horas |

---

## Códigos HTTP

| Código | Significado | Cuándo se usa |
|---|---|---|
| `200` | OK | Petición exitosa |
| `201` | Created | Recurso creado (registro, publicación) |
| `204` | No Content | Eliminación exitosa |
| `400` | Bad Request | Datos inválidos |
| `401` | Unauthorized | No autenticado / token inválido |
| `403` | Forbidden | Sin permisos (rol incorrecto) |
| `404` | Not Found | Recurso no existe |
| `409` | Conflict | Recurso duplicado |
| `500` | Internal Server Error | Error del servidor |

---

## Formato de error estándar

**Todos** los errores deben devolver esta estructura:

```json
{
  "timestamp": "2026-09-24T20:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "El correo ya está registrado",
  "path": "/api/auth/registro"
}
```

---

##  JWT

| Aspecto | Valor |
|---|---|
| **Algoritmo** | HS256 |
| **Expiración** | 24 horas (86 400 000 ms) |
| **Header frontend** | `Authorization: Bearer <token>` |

**Payload esperado:**
```json
{
  "sub": "juan@ucundinamarca.edu.co",
  "rol": "ESTUDIANTE",
  "iat": 1727200000,
  "exp": 1727286400
}
```

---

#  Módulo Autenticación (`/api/auth`)

## 1. POST `/api/auth/registro`

Registra un nuevo **estudiante**.

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@ucundinamarca.edu.co",
  "password": "MiPassword123"
}
```

**Validaciones:** nombre ≥ 3 caracteres, correo válido y único, password ≥ 8 con mayúscula y número.

**Response 201:**
```json
{
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@ucundinamarca.edu.co",
    "rol": "ESTUDIANTE",
    "fechaRegistro": "2026-09-24T20:00:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 409:** correo ya registrado.
**Response 400:** validación fallida.

---

## 2. POST `/api/auth/login`

Inicia sesión (estudiantes y docentes).

**Request:**
```json
{
  "correo": "juan@ucundinamarca.edu.co",
  "password": "MiPassword123"
}
```

**Response 200:** igual que registro.

**Response 401:** credenciales inválidas.

---

## 3. GET `/api/auth/perfil`

Obtiene el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "correo": "juan@ucundinamarca.edu.co",
  "rol": "ESTUDIANTE",
  "fechaRegistro": "2026-09-24T20:00:00"
}
```

---

# Módulo Usuario (`/api/usuario`)

## 4. PUT `/api/usuario/perfil`

Actualiza el perfil del usuario autenticado.

**Request:**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "correo": "juan.nuevo@ucundinamarca.edu.co"
}
```

**Response 200:** devuelve el `Usuario` actualizado.

---

## 5. PUT `/api/usuario/password`

Cambia la contraseña del usuario autenticado.

**Request:**
```json
{
  "passwordActual": "MiPassword123",
  "passwordNueva": "NuevaPassword456",
  "passwordConfirmacion": "NuevaPassword456"
}
```

**Response 200:**
```json
{
  "mensaje": "Contraseña actualizada correctamente"
}
```

**Response 401:** contraseña actual incorrecta.
**Response 400:** la nueva contraseña no cumple las reglas.

---

## 6. POST `/api/usuario/recuperar-password`

Solicita recuperación de contraseña.

**Request:**
```json
{
  "correo": "juan@ucundinamarca.edu.co"
}
```

**Response 200:**
```json
{
  "mensaje": "Si el correo existe, se enviaron instrucciones"
}
```

> Siempre responde 200 por seguridad (no revela si el correo existe).

---

## 7. POST `/api/usuario/resetear-password`

Restablece la contraseña usando el token del correo.

**Request:**
```json
{
  "token": "abc123...",
  "passwordNueva": "NuevaPassword456"
}
```

**Response 200:**
```json
{
  "mensaje": "Contraseña restablecida correctamente"
}
```

---

#  Módulo Práctica (`/api/practica`)

>  Requiere autenticación (rol ESTUDIANTE).

## 8. GET `/api/practica/preguntas`

Lista preguntas filtradas por tema y dificultad.

**Query params:**
- `tema` → `limites` | `derivadas` | `integrales` (opcional)
- `dificultad` → `basico` | `intermedio` | `avanzado` (opcional)
- `page` → página (default 0)
- `size` → tamaño (default 10)

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "tema": "derivadas",
      "enunciado": "¿Cuál es la derivada de f(x) = x² + 3x?",
      "dificultad": "intermedio",
      "opciones": [
        { "id": 1, "letra": "A", "texto": "2x + 3" },
        { "id": 2, "letra": "B", "texto": "x² + 3" },
        { "id": 3, "letra": "C", "texto": "2x" },
        { "id": 4, "letra": "D", "texto": "x + 3" }
      ]
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "page": 0
}
```

>  **Nunca** se devuelve `es_correcta` al frontend antes de que el estudiante responda.

---

## 9. POST `/api/practica/preguntas/{id}/responder`

Envía la respuesta seleccionada.

**Request:**
```json
{
  "opcionId": 1
}
```

**Response 200 (correcta):**
```json
{
  "esCorrecta": true,
  "opcionCorrectaId": 1,
  "pista": null
}
```

**Response 200 (incorrecta):**
```json
{
  "esCorrecta": false,
  "opcionCorrectaId": null,
  "pista": "Recuerda la regla de la potencia: d/dx[x^n] = n·x^(n-1)"
}
```

> Si la respuesta es incorrecta, se muestra la pista. La opción correcta **no se revela** hasta que el estudiante responda bien o use "Ver solución".

---

## 10. GET `/api/practica/preguntas/{id}/pista`

Solicita una pista adicional.

**Response 200:**
```json
{
  "pista": "Deriva cada término por separado y luego suma los resultados."
}
```

---

## 11. GET `/api/practica/progreso`

Progreso del estudiante en cada tema.

**Response 200:**
```json
{
  "limites": { "respondidas": 10, "correctas": 7, "porcentaje": 70 },
  "derivadas": { "respondidas": 8, "correctas": 5, "porcentaje": 62 },
  "integrales": { "respondidas": 5, "correctas": 2, "porcentaje": 40 }
}
```

---

#  Módulo Chat IA (`/api/chat`)

>  Requiere autenticación.

## 12. POST `/api/chat/mensaje`

Envía un mensaje al tutor IA y recibe la respuesta.

**Request:**
```json
{
  "mensaje": "No entiendo cómo empezar a derivar f(x) = x² + 3x",
  "contexto": {
    "preguntaId": 1,
    "tema": "derivadas"
  }
}
```

**Response 200:**
```json
{
  "id": 42,
  "mensaje": "No entiendo cómo empezar a derivar f(x) = x² + 3x",
  "respuestaIA": "Antes de derivar, ¿qué regla crees que aplica aquí? ¿Recuerdas la regla de la potencia?",
  "fechaHora": "2026-09-24T20:30:00"
}
```

> **La IA nunca da la respuesta directa.** Siempre responde con preguntas guía. Si el estudiante insiste por la respuesta, la IA responde: "Revisa el método de solución en tus apuntes y vuelve a intentarlo".

---

## 13. GET `/api/chat/historial`

Historial de conversaciones del estudiante.

**Query params:** `page`, `size`.

**Response 200:**
```json
{
  "content": [
    {
      "id": 42,
      "mensaje": "No entiendo cómo empezar...",
      "respuestaIA": "Antes de derivar, ¿qué regla...",
      "fechaHora": "2026-09-24T20:30:00"
    }
  ],
  "totalElements": 100,
  "totalPages": 10,
  "page": 0
}
```

---

#  Módulo Foro (`/api/foro`)

>  Requiere autenticación.

## 14. GET `/api/foro/publicaciones`

Lista de publicaciones del foro.

**Query params:**
- `tema` → filtro por tema
- `busqueda` → texto libre
- `orden` → `reciente` | `antiguo` | `respuestas`
- `page`, `size`

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "titulo": "¿Cómo resolver la integral int(x * e^x dx)?",
      "autor": {
        "id": 5,
        "nombre": "Carlos Mendoza",
        "iniciales": "CM",
        "rol": "ESTUDIANTE"
      },
      "tema": "integrales",
      "contenido": "Buenas tardes profesor...",
      "fechaCreacion": "2026-09-24T18:00:00",
      "fechaRelativa": "Hace 2 horas",
      "respuestasCount": 3,
      "hasOfficialAnswer": false
    }
  ],
  "totalElements": 25,
  "totalPages": 3,
  "page": 0
}
```

---

## 15. POST `/api/foro/publicaciones`

Crea una nueva publicación.

**Request:**
```json
{
  "titulo": "Duda con derivadas implícitas",
  "contenido": "No entiendo cómo derivar...",
  "tema": "derivadas"
}
```

**Response 201:** devuelve la `Publicacion` creada.

---

## 16. GET `/api/foro/publicaciones/{id}`

Detalle de una publicación con sus respuestas (anidadas).

**Response 200:**
```json
{
  "id": 1,
  "titulo": "¿Cómo resolver la integral int(x * e^x dx)?",
  "autor": { "id": 5, "nombre": "Carlos Mendoza", "rol": "ESTUDIANTE" },
  "tema": "integrales",
  "contenido": "...",
  "fechaCreacion": "2026-09-24T18:00:00",
  "hasOfficialAnswer": false,
  "respuestas": [
    {
      "id": 101,
      "autor": { "id": 7, "nombre": "Andrea Gómez", "rol": "ESTUDIANTE" },
      "contenido": "Usa la regla ILATE...",
      "fechaCreacion": "2026-09-24T19:00:00",
      "esOficial": false,
      "respuestasHijas": [
        {
          "id": 1011,
          "autor": { "id": 5, "nombre": "Carlos Mendoza", "rol": "ESTUDIANTE" },
          "contenido": "¡Muchas gracias!",
          "fechaCreacion": "2026-09-24T19:15:00",
          "esOficial": false,
          "respuestasHijas": []
        }
      ]
    }
  ]
}
```

---

## 17. POST `/api/foro/publicaciones/{id}/respuestas`

Responde a una publicación (o a otra respuesta si se indica `respuestaPadreId`).

**Request:**
```json
{
  "contenido": "Usa la regla ILATE...",
  "respuestaPadreId": null
}
```

**Response 201:** devuelve la `Respuesta` creada.

---

#  Módulo Docente (`/api/docente`)

>  Requiere rol DOCENTE. Si un estudiante accede, devuelve `403 Forbidden`.

## 18. GET `/api/docente/kpis`

KPIs del dashboard del docente.

**Response 200:**
```json
{
  "sinRespuestaOficial": 5,
  "respuestasPorValidar": 7,
  "tasaRetencion": 88,
  "totalPublicaciones": 15
}
```

---

## 19. GET `/api/docente/tareas`

Tareas pendientes del día.

**Response 200:**
```json
[
  {
    "id": 1,
    "titulo": "Validar duda sobre Integral por Partes",
    "curso": "Cálculo II",
    "fechaLimite": "2026-09-26T18:00:00",
    "completada": false
  }
]
```

---

## 20. PATCH `/api/docente/tareas/{id}`

Marca una tarea como completada o pendiente.

**Request:**
```json
{ "completada": true }
```

**Response 200:** devuelve la `Tarea` actualizada.

---

## 21. GET `/api/docente/actividad`

Actividad reciente del docente.

**Response 200:**
```json
[
  {
    "id": 1,
    "tipo": "oficial",
    "texto": "Marcaste como oficial la respuesta en Integral por partes",
    "fechaRelativa": "Hace 1 hora"
  }
]
```

**Valores de `tipo`:** `"oficial"` | `"respuesta"` | `"pregunta"`.

---

## 22. GET `/api/docente/notificaciones`

Publicaciones del foro **sin respuesta oficial**.

**Query params:**
- `tema`, `busqueda`, `orden`, `page`, `size`

**Response 200:**
```json
{
  "content": [
    {
      "id": 1,
      "titulo": "¿Cómo resolver la integral int(x * e^x dx)?",
      "autor": { "id": 5, "nombre": "Carlos Mendoza", "iniciales": "CM" },
      "tema": "integrales",
      "fechaRelativa": "Hace 2 horas",
      "respuestasCount": 3,
      "hasOfficialAnswer": false,
      "contenido": "..."
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "page": 0
}
```

---

## 23. POST `/api/docente/respuestas/{id}/oficial`

Marca una respuesta como oficial.

**Response 200:**
```json
{
  "id": 101,
  "esOficial": true,
  "publicacionId": 1
}
```

>  Solo puede haber UNA respuesta oficial por publicación. Si ya existía otra, se desmarca automáticamente.

---

## 24. DELETE `/api/docente/respuestas/{id}/oficial`

Quita el estado oficial de una respuesta.

**Response 200:**
```json
{
  "id": 101,
  "esOficial": false,
  "publicacionId": 1
}
```

---

#  Modelos compartidos

### Usuario
```typescript
{
  id: number;
  nombre: string;
  correo: string;
  rol: 'ESTUDIANTE' | 'DOCENTE';
  fechaRegistro: string;
}
```

### AuthResponse
```typescript
{
  usuario: Usuario;
  token: string;
}
```

### ApiError
```typescript
{
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
```

### Pregunta
```typescript
{
  id: number;
  tema: 'limites' | 'derivadas' | 'integrales';
  enunciado: string;
  dificultad: 'basico' | 'intermedio' | 'avanzado';
  opciones: Opcion[];
}
```

### Opcion
```typescript
{
  id: number;
  letra: 'A' | 'B' | 'C' | 'D';
  texto: string;
}
```

### Publicacion
```typescript
{
  id: number;
  titulo: string;
  autor: Autor;
  tema: string;
  contenido: string;
  fechaCreacion: string;
  fechaRelativa: string;
  respuestasCount: number;
  hasOfficialAnswer: boolean;
}
```

### Respuesta
```typescript
{
  id: number;
  autor: Autor;
  contenido: string;
  fechaCreacion: string;
  esOficial: boolean;
  respuestasHijas: Respuesta[];
}
```

### Autor
```typescript
{
  id: number;
  nombre: string;
  iniciales?: string;
  rol: 'ESTUDIANTE' | 'DOCENTE';
}
```

### Chat
```typescript
{
  id: number;
  mensaje: string;
  respuestaIA: string;
  fechaHora: string;
}
```

### KpisDocente
```typescript
{
  sinRespuestaOficial: number;
  respuestasPorValidar: number;
  tasaRetencion: number;
  totalPublicaciones: number;
}
```

### TareaDocente
```typescript
{
  id: number;
  titulo: string;
  curso: string;
  fechaLimite: string;
  completada: boolean;
}
```

### ActividadDocente
```typescript
{
  id: number;
  tipo: 'oficial' | 'respuesta' | 'pregunta';
  texto: string;
  fechaRelativa: string;
}
```

---

# 📋 Reglas de convivencia

1. **Cualquier cambio** en el contrato se avisa a la otra parte **antes** de implementarlo.
2. **Los nombres de los campos son exactos**: `correo` (no `email`), `token` (no `accessToken`), `usuario` (no `user`).
3. **Los roles** siempre en mayúsculas: `ESTUDIANTE`, `DOCENTE`.
4. **Los códigos HTTP** son los aquí definidos.
5. **Los errores** siempre con la estructura estándar.
6. **Los endpoints protegidos** siempre validan el JWT y el rol.
7. **Nunca se devuelve la respuesta correcta** de una pregunta antes de que el estudiante responda.
8. **La IA nunca da la respuesta directa**, solo preguntas guía.

---

#  Roadmap por sprints

| Sprint | Módulos | Endpoints |
|---|---|---|
| **1** | Autenticación | 1, 2, 3 |
| **2** | Práctica (base) | 8, 9 |
| **3** | Práctica completa + Chat | 10, 11, 12, 13 |
| **4** | Foro | 14, 15, 16, 17 |
| **5** | Docente + oficiales | 18, 19, 20, 21, 22, 23, 24 |
| **Extra** | Usuario (perfil) | 4, 5, 6, 7 |

---

**Fin del documento.**
