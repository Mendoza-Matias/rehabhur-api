# rehabhur-api

API REST de rehabilitación construida con Express 5, TypeScript y Zod.

## Requisitos

- Node.js
- npm

## Desarrollo

```sh
npm install
npm run dev
```

El servidor escucha en el puerto `3000` por defecto. Se puede configurar con la
variable de entorno `PORT` (entero entre `1` y `65535`).

## Verificación y producción

```sh
npm test
npm run typecheck
npm run build
npm start
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

- `JWT_SECRET`: clave Base64 de 32 bytes (256 bits).
- `JWT_ACCESS_TTL`: duración del access token (por defecto `15m`).
- `JWT_REFRESH_TTL`: duración del refresh token (por defecto `7d`).

## Rutas

- `GET /health`: estado del servidor.
- `GET /api/v1/teachers`, `GET /api/v1/teachers/:id`
- `POST /api/v1/teachers`, `PATCH /api/v1/teachers/:id`, `DELETE /api/v1/teachers/:id`
- `GET /api/v1/patients`, `GET /api/v1/patients/:id`
- `PATCH /api/v1/patients/:id`, `DELETE /api/v1/patients/:id`
- `GET /api/v1/persons`, `GET /api/v1/persons/:id`
- `POST /api/v1/persons`, `PATCH /api/v1/persons/:id`, `DELETE /api/v1/persons/:id`
- `GET /api/v1/exercises`, `GET /api/v1/exercises/:id`
- `POST /api/v1/exercises`, `PATCH /api/v1/exercises/:id`, `DELETE /api/v1/exercises/:id`
- `GET /api/v1/options/body-regions` (también `motion-types` y `materials`)
- `POST /api/v1/auth/signup`, `POST /api/v1/auth/signin`
- `POST /api/v1/auth/refresh-token`, `POST /api/v1/auth/logout`
- `GET /api/v1/auth/profile`
- `GET /api/v1/users`, `POST /api/v1/users` (solo administradores)

Las personas aceptan `firstName`, `lastName`, `dni`, `email`, `nationality` y
`role` (`admin`, `docente`, `estudiante` o `paciente`). La actualización es
parcial y requiere al menos un campo. Los ejercicios aceptan `name`,
`bodyRegion`, `motionType`, `material`, `linkVideo` e `instructions`; las
regiones, tipos de movimiento y materiales se consultan en `/options`.

La creación y actualización de docentes aceptan `name`, `last_name`, `email`,
`dni` y `commission`. La actualización es parcial y requiere al menos un campo.
La actualización de pacientes también es parcial. Los datos de docentes,
pacientes, personas y ejercicios continúan almacenándose en memoria; se
reinician con el proceso y no constituyen persistencia de producción.

## Autenticación y autorización

La API usa JWT. `POST /signup` y `POST /signin` devuelven:

```json
{
  "user": {
    "id": 1,
    "firstName": "Usuario",
    "lastName": "Administrador",
    "dni": "30111222",
    "email": "admin@rehabhur.com",
    "role": "admin"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

El `accessToken` se envía en `Authorization: Bearer <token>` y dura 15 minutos
por defecto. El `refreshToken` dura 7 días, se rota en cada renovación y el
anterior deja de ser válido.

### Endpoints

- `POST /api/v1/auth/signup`: registro público. Siempre crea un `paciente`; si
  se envía `role`, se ignora.
- `POST /api/v1/auth/signin`: recibe `email` y `password`.
- `POST /api/v1/auth/refresh-token`: recibe `refreshToken` y devuelve un par
  nuevo de tokens.
- `POST /api/v1/auth/logout`: recibe `refreshToken` y lo revoca.
- `GET /api/v1/auth/profile`: requiere token de acceso. Devuelve los datos del
  usuario y su `role`, que el frontend puede usar para elegir las pantallas.
- `GET /api/v1/users`: lista los usuarios. Solo `admin`.
- `POST /api/v1/users`: crea una cuenta con el rol indicado. Solo `admin`.

### Roles y creación de cuentas

- `paciente`: se registra solo con `/signup`.
- `estudiante`, `docente` y `admin`: los crea un administrador con
  `POST /api/v1/users`.
- El rol "alumno" se representa como `estudiante`, igual que en
  `/api/v1/persons`.

### Proteger rutas

```ts
import { requireAuth, requireRole } from "../middlewares/auth.js";

router.get("/", requireAuth(userService), requireRole("admin"), controller.findAll);
```

Los refresh tokens se guardan en memoria: al reiniciar el proceso los usuarios
deben volver a iniciar sesión.

### Cuentas de prueba

| Rol | Email | Contraseña |
| --- | --- | --- |
| admin | `admin@rehabhur.com` | `Password123` |
| docente | `docente@rehabhur.com` | `Password123` |
| estudiante | `estudiante@rehabhur.com` | `Password123` |
| paciente | `paciente@rehabhur.com` | `Password123` |

## Imagen de prueba

Al integrar cambios en `develop`, el workflow ejecuta build y tests y, si ambos
finalizan correctamente, publica la imagen en GitHub Container Registry:

```sh
docker pull ghcr.io/rehabhur/rehabhur-api:develop
docker run --rm -p 3000:3000 ghcr.io/rehabhur/rehabhur-api:develop
```

También se publica una etiqueta con el SHA corto del commit para identificar
una versión concreta. El paquete debe tener habilitada la lectura para quienes
vayan a descargar la imagen.
