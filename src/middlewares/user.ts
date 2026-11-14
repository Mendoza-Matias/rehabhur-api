import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { users } from "../mocks/user.mock.js";
import { JWT_SECRET } from "../config/jwt.js";

export const requireSignin = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {

        if (req.headers.authorization) {

            const token: string = req.headers.authorization.substring(7); //extrae el header authorization

            console.log("LLEGUEEEEEEEEEE " + token)

            const verifytoken: any = jwt.verify(token, JWT_SECRET);

            console.log("VERIFICOOOO EL TOKEN " + verifytoken)

            const rootuser = users.find((user) => user.email === verifytoken.email);

            if (!rootuser) {
                throw "Usuario no encontrado";
            }
            req.user = rootuser; //setea el usuario root en la request
            next();
        } else {
            throw "Se requiere autenticación";
        }
    } catch (error) {
        return res.status(400).json({ message: "Se requiere autorización", error: error });
    }
};

export const checkAdmin = (req: any, res: Response<unknown>, next: NextFunction) => {
    if (req.user?.role !== "admin") {
        return res.status(400).json({ message: "El usuario no es administrador" });
    }
    next();
};