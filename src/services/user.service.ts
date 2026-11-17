import bcrypt from "bcryptjs";

import { toUserResponseDto, type UserResponseDto } from "../dtos/user-response.dto.js";
import { UserRepository } from "../repository/users.repository.js";
import type { CreateUserDto } from "../schemas/auth.schema.js";
import type { ListUsersQuery } from "../schemas/user.schema.js";
import type { User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { paginate, type PaginatedResponse } from "../utils/pagination.js";

export class UserService {
    constructor(private readonly repository: UserRepository) { }

    findAll(query: ListUsersQuery = { page: 1, limit: 10 }): PaginatedResponse<UserResponseDto> {
        const search = query.search?.toLowerCase();
        const users = this.repository.findAll().map(toUserResponseDto).filter((user) => {
            if (query.role && user.role !== query.role) {
                return false;
            }

            if (!search) {
                return true;
            }

            return [user.firstName, user.lastName, user.dni, user.email]
                .some((value) => value.toLowerCase().includes(search));
        });

        return paginate(users, query);
    }

    findById(id: number): UserResponseDto {
        const user = this.repository.findById(id);
        if (!user) {
            throw new AppError(404, "USER_NOT_FOUND", "No se encontró el usuario");
        }
        return toUserResponseDto(user);
    }

    async create(data: CreateUserDto): Promise<UserResponseDto> {
        if (this.repository.findByEmail(data.email)) {
            throw new AppError(
                409,
                "DUPLICATE_EMAIL",
                "Ya existe un usuario registrado con este correo electrónico"
            );
        }

        if (this.repository.findByDni(data.dni)) {
            throw new AppError(
                409,
                "DUPLICATE_DNI",
                "Ya existe un usuario registrado con este DNI"
            );
        }

        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = this.repository.create({
            firstName: data.firstName,
            lastName: data.lastName,
            dni: data.dni,
            email: data.email,
            passwordHash,
            role: data.role,
        });

        return toUserResponseDto(user);
    }

    async validateCredentials(email: string, password: string): Promise<User> {
        const user = this.repository.findByEmail(email);

        if (!user) {
            throw new AppError(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos");
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new AppError(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos");
        }

        return user;
    }
}
