import bcrypt from "bcryptjs";

import type { User } from "../models/user.model.js";

// Contraseña de todas las cuentas de prueba (ver README).
export const seedPassword = "Password123";

const seedPasswordHash = bcrypt.hashSync(seedPassword, 10);

export const users: User[] = [
    {
        id: 1,
        firstName: "Usuario",
        lastName: "Administrador",
        dni: "30111222",
        email: "admin@rehabhur.com",
        passwordHash: seedPasswordHash,
        role: "admin",
    },
    {
        id: 2,
        firstName: "Nadia",
        lastName: "Docente",
        dni: "28333444",
        email: "docente@rehabhur.com",
        passwordHash: seedPasswordHash,
        role: "docente",
    },
    {
        id: 3,
        firstName: "Elena",
        lastName: "Estudiante",
        dni: "40111222",
        email: "estudiante@rehabhur.com",
        passwordHash: seedPasswordHash,
        role: "estudiante",
    },
    {
        id: 4,
        firstName: "Pablo",
        lastName: "Paciente",
        dni: "45111222",
        email: "paciente@rehabhur.com",
        passwordHash: seedPasswordHash,
        role: "paciente",
    },
];
<<<<<<< HEAD

// Usuarios adicionales para probar listados y paginación.
const extraRoles = ["estudiante", "paciente", "docente", "admin"] as const;

for (let index = 1; index <= 20; index += 1) {
    users.push({
        id: users.length + 1,
        firstName: `Usuario${index}`,
        lastName: "De Prueba",
        dni: String(46_000_000 + index),
        email: `usuario${index}@rehabhur.com`,
        passwordHash: seedPasswordHash,
        role: extraRoles[(index - 1) % extraRoles.length]!,
    });
}
=======
>>>>>>> develop
