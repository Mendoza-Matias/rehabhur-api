# rehabhur-api

API REST de rehabilitación construida con Express 5, TypeScript y Zod.

## Desarrollo

```sh
npm install
npm run dev
```

Copiar `.env.example` a `.env` y completar `JWT_SECRET` con una clave Base64 de
32 bytes. El servidor escucha en `http://localhost:3000` (configurable con
`PORT`).

Verificación:

```sh
npm test
npm run typecheck
npm run build
```

Variables opcionales: `JWT_ACCESS_TTL` (`15m`) y `JWT_REFRESH_TTL` (`7d`).

## Rutas

- `GET /health`
- `GET /api/v1/teachers`, `GET /api/v1/teachers/:id`
- `POST /api/v1/teachers`, `PATCH /api/v1/teachers/:id`, `DELETE /api/v1/teachers/:id`
- `GET /api/v1/patients`, `GET /api/v1/patients/:id`
- `PATCH /api/v1/patients/:id`, `DELETE /api/v1/patients/:id`
- `GET /api/v1/persons`, `GET /api/v1/persons/:id`
- `POST /api/v1/persons`, `PATCH /api/v1/persons/:id`, `DELETE /api/v1/persons/:id`
- `GET /api/v1/exercises`, `GET /api/v1/exercises/:id`
- `POST /api/v1/exercises`, `PATCH /api/v1/exercises/:id`, `DELETE /api/v1/exercises/:id`
- `GET /api/v1/options/body-regions`, `motion-types`, `materials`

Los datos se almacenan en memoria y se reinician con el proceso.

## Paginación

Los listados de docentes, pacientes, personas, ejercicios y usuarios aceptan
`page` (desde 1) y `limit` (1 a 100). Por defecto: `?page=1&limit=10`.

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

`/api/v1/options/*` devuelve las opciones completas y no se pagina.

## Autenticación

La API usa JWT. El access token dura 15 minutos y el refresh token 7 días, con
rotación en cada renovación. Enviar `Authorization: Bearer <accessToken>`.

- `POST /api/v1/auth/signup`: registro público; siempre crea un `paciente`.
- `POST /api/v1/auth/signin`: recibe `email` y `password`.
- `POST /api/v1/auth/refresh-token`: recibe `refreshToken`.
- `POST /api/v1/auth/logout`: revoca el `refreshToken`.
- `GET /api/v1/auth/profile`: datos del usuario y su `role`.
- `GET /api/v1/users`, `POST /api/v1/users`: solo `admin`.

Roles: `paciente` se registra solo; `estudiante`, `docente` y `admin` los crea
un administrador. "Alumno" se representa como `estudiante`.

Cuentas de prueba:

| Rol | Email | Contraseña |
| --- | --- | --- |
| admin | `admin@rehabhur.com` | `Password123` |
| docente | `docente@rehabhur.com` | `Password123` |
| estudiante | `estudiante@rehabhur.com` | `Password123` |
| paciente | `paciente@rehabhur.com` | `Password123` |

Los refresh tokens también se guardan en memoria: al reiniciar el proceso los
usuarios deben volver a iniciar sesión.

## Docker

```sh
docker compose up --build
```

O construir la imagen manualmente:

```sh
docker build -t ghcr.io/rehabhur/rehabhur-api:local .
docker run --rm -p 3000:3000 --env-file .env ghcr.io/rehabhur/rehabhur-api:local
```

## CI/CD

El workflow corre typecheck, tests y build en pull requests y push a `main` y
`develop`, y publica la imagen en GitHub Container Registry en cada push:

| Rama | Tags |
| --- | --- |
| `develop` | `develop`, `sha-<commit>` |
| `main` | `latest`, `main`, `sha-<commit>` |

Deploy en el servidor:

```sh
docker compose pull
docker compose up -d
```

Usar `IMAGE_TAG=develop` para staging o `IMAGE_TAG=sha-<commit>` para volver a
una versión anterior. El paquete de GHCR debe permitir la lectura.
