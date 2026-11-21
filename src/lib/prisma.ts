// PrismaClient: clase generada por `prisma generate` a partir del schema.
// Al instanciarla, expone los métodos de consulta DML del modelo Teacher:
//   prisma.teacher.findMany()   → SELECT ... FROM teachers
// que traducirá su API al de Prisma.
import { PrismaClient } from "../generated/prisma/client.js";

// PrismaPg: adaptador que conecta Prisma con el driver real `pg`.
// Prisma 7 ya no incluye motor propio de conexión; delega en este adaptador,
// que a su vez usa `pg` para abrir sockets TCP contra PostgreSQL.
import { PrismaPg } from "@prisma/adapter-pg";

// Instancia del adaptador: aquí se configura la conexión (URL, pool, etc.).
// Crear el adaptador NO abre conexión todavía; solo guarda la configuración.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Instancia única del cliente para toda la app.
// Compartirla evita abrir múltiples pools de conexiones a PostgreSQL.
export const prisma = new PrismaClient({ adapter });