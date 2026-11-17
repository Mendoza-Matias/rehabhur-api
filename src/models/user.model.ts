import type { Role } from "./role.model.js";

export type UserRole = Role;

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface CreateUserData {
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}
