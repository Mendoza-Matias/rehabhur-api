import { z } from "zod";
import { personRoles } from "../models/person.model.js";
<<<<<<< HEAD
=======
import { paginationQuerySchema } from "./pagination.schema.js";
>>>>>>> develop

export const createPersonSchema = z.object({
    firstName: z.string().trim().min(1, "El nombre es obligatorio"),
    lastName: z.string().trim().min(1, "El apellido es obligatorio"),
    dni: z
        .string()
        .trim()
        .regex(/^\d{7,8}$/, "El DNI debe contener entre 7 y 8 dígitos"),
    email: z.string().trim().email("El correo electrónico no es válido"),
    nationality: z.string().trim().min(1, "La nacionalidad es obligatoria"),
    role: z.enum(personRoles),
});

export const updatePersonSchema = createPersonSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Debes enviar al menos un campo para actualizar",
    });

<<<<<<< HEAD
export type CreatePersonDto = z.infer<typeof createPersonSchema>;
export type UpdatePersonDto = z.infer<typeof updatePersonSchema>;
=======
export const listPersonsQuerySchema = paginationQuerySchema.extend({
    search: z.string().trim().optional(),
    role: z.enum(personRoles).optional(),
});

export type CreatePersonDto = z.infer<typeof createPersonSchema>;
export type UpdatePersonDto = z.infer<typeof updatePersonSchema>;
export type ListPersonsQuery = z.infer<typeof listPersonsQuerySchema>;
>>>>>>> develop
