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

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

- `JWT_SECRET`: clave Base64 de 32 bytes (256 bits).
- `JWT_ACCESS_TTL`: duración del access token (por defecto `15m`).
- `JWT_REFRESH_TTL`: duración del refresh token (por defecto `7d`).

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
- `GET /api/v1/options/body-regions` (también `motion-types` y `materials`)
- `POST /api/v1/auth/signup`, `POST /api/v1/auth/signin`
- `POST /api/v1/auth/refresh-token`, `POST /api/v1/auth/logout`
- `GET /api/v1/auth/profile`
- `GET /api/v1/users`, `POST /api/v1/users` (solo administradores)

Los datos se almacenan en memoria y se reinician con el proceso.

## Paginación

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

## Docker

El `Dockerfile` compila TypeScript en una primera etapa y en la imagen final
deja solo las dependencias de producción. Para construir y correr localmente:

```sh
docker build -t ghcr.io/rehabhur/rehabhur-api:local .
docker run --rm -p 3000:3000 --env-file .env ghcr.io/rehabhur/rehabhur-api:local
```

También se puede usar Docker Compose. Copiar `.env.example` a `.env`, completar
`JWT_SECRET` y ejecutar:

```sh
docker compose up --build
```

El servicio queda en `http://localhost:3000` y expone `/health` para el
healthcheck.

## CI/CD e imágenes

El workflow `.github/workflows/build.yml` corre en pull requests y push a
`main` y `develop`:

1. Instala dependencias, ejecuta typecheck, tests y build.
2. Construye la imagen Docker.
3. Publica la imagen en GitHub Container Registry solo en push.

Configurar el secreto `JWT_SECRET` en GitHub Actions con una clave Base64
válida de 32 bytes. Los tests de ambos workflows lo requieren; los pull
requests desde forks no reciben secretos del repositorio.

Tags publicados:

| Evento | Tags |
| --- | --- |
| Push a `develop` | `develop`, `sha-<commit>` |
| Push a `main` (merge de develop) | `latest`, `main`, `sha-<commit>` |

En pull requests la imagen se construye pero no se publica.

### Deploy en el servidor

Copiar `docker-compose.yml` y un `.env` con `JWT_SECRET` al servidor y ejecutar:

```sh
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f api
```

Producción usa `latest` por defecto. Para staging:

```sh
IMAGE_TAG=develop docker compose up -d
```

Para volver a una versión anterior, usar el tag `sha-<commit>`:

```sh
IMAGE_TAG=sha-abc1234 docker compose pull
IMAGE_TAG=sha-abc1234 docker compose up -d
```

El paquete de GHCR debe tener habilitada la lectura para quienes vayan a
descargar la imagen.
