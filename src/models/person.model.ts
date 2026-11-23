import { roles, type Role } from "./role.model.js";

export const personRoles = roles;

export type PersonRole = Role;

export interface Person {
    id: number;
    firstName: string;
    last_name: string;
    dni: string;
    email: string;
    nationality: string;
    role: PersonRole;
}
