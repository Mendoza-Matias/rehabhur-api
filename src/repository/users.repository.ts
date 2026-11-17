import { users } from "../mocks/user.mock.js";
import type { CreateUserData, User } from "../models/user.model.js";

export class UserRepository {
    findAll(): User[] {
        return users.map((user) => ({ ...user }));
    }

    findById(id: number): User | undefined {
        const user = users.find((item) => item.id === id);
        return user ? { ...user } : undefined;
    }

    findByEmail(email: string): User | undefined {
        const normalized = email.trim().toLowerCase();
        const user = users.find((item) => item.email === normalized);
        return user ? { ...user } : undefined;
    }

    findByDni(dni: string): User | undefined {
        const user = users.find((item) => item.dni === dni);
        return user ? { ...user } : undefined;
    }

    create(data: CreateUserData): User {
        const id = users.length
            ? Math.max(...users.map((user) => user.id)) + 1
            : 1;

        const user: User = { id, ...data };
        users.push(user);
        return { ...user };
    }
}
