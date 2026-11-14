import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

//importo los mocks de los servicios
import { users } from "../mocks/user.mock.js";

import { Request, Response } from "express";
import { JWT_SECRET } from "../config/jwt.js";

export class UserController {

    findAll(_req: Request, res: Response<unknown>) {
        return res.status(200).json(users);
    }

    signin = async (req: Request, res: Response<unknown>) => {

        const { email, password } = req.body;

        console.log(email)
        console.log(password)

        try {

            const user = users.find((user) => user.email === email);

            if (user) {
                const isPasswordMatched = await bcrypt.compare(password, user.password);

                if (isPasswordMatched) {
                    //extraer el role del usuario
                    const token = jwt.sign({ email: user.email, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });

                    res.status(200).json({ token });
                }
            }
        } catch (error) {
            res.status(400).json({ message: "Error al iniciar sesión", body: error });
        }
    }

    signup = async (req: Request, res: Response<unknown>) => {

        const { name, last_name, dni, email, password } = req.body

        const hash_password = await bcrypt.hash(password, 10);

        try {

            const existentUser = users.find((user) => user.email === email);

            if (existentUser) {
                res.status(400).json();
            }

            const user = {
                id: users.length + 1,
                name,
                last_name,
                dni,
                email,
                password: hash_password,
                role: "admin"
            }

            users.push(user);

            res.status(201).json(user);

        } catch (error) {
            res.status(400).json();
        }
    }
}