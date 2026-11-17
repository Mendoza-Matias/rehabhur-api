import { z } from "zod";
import { roles } from "../models/role.model.js";

const userFields = {
    firstName: z.string().trim().min(1, "El nombre es obligatorio"),
    lastName: z.string().trim().min(1, "El apellido es obligatorio"),
    dni: z
        .string()
        .trim()
        .regex(/^\d{7,8}$/, "El DNI debe contener entre 7 y 8 dígitos"),
    email: z.string().trim().toLowerCase().email("El correo electrónico no es válido"),
};

const passwordField = z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra")
    .regex(/\d/, "La contraseña debe incluir al menos un número");

// Registro público: siempre crea pacientes.
export const signupSchema = z.object({
    ...userFields,
    password: passwordField,
});

export const signinSchema = z.object({
    email: z.string().trim().toLowerCase().email("El correo electrónico no es válido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

// El refresh token puede venir en la cookie httpOnly o en el body (clientes nativos).
export const refreshTokenSchema = z
    .object({
        refreshToken: z.string().trim().min(1, "El refresh token no puede estar vacío").optional(),
    })
    .optional();

// Solo un administrador puede crear cuentas con estos roles.
export const createUserSchema = z.object({
    ...userFields,
    password: passwordField,
    role: z.enum(roles),
});

export type SignupDto = z.infer<typeof signupSchema>;
export type SigninDto = z.infer<typeof signinSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
