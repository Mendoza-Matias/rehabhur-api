import { User } from "../models/user.model.js";

export const users: User[] = [
    // Admin
    {
        id: 1,
        name: "Carlos",
        last_name: "Méndez",
        email: "carlos.mendez@email.com",
        dni: "32.456.789",
        password: "Password123",
        role: "admin",
    }
];