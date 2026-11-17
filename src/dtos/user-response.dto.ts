import type { PublicUser, User } from "../models/user.model.js";

export type UserResponseDto = PublicUser;

export const toUserResponseDto = (user: User): UserResponseDto => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    dni: user.dni,
    email: user.email,
    role: user.role,
});
