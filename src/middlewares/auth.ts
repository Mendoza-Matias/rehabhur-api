import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/jwt.js";
import type { UserResponseDto } from "../dtos/user-response.dto.js";
import type { AccessTokenPayload } from "../models/auth.model.js";
import type { UserRole } from "../models/user.model.js";
import { UserService } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";

declare global {
    namespace Express {
        interface Request {
            user?: UserResponseDto;
        }
    }
}

export const requireAuth = (users: UserService): RequestHandler => {
    return (req, _res, next): void => {
        const header = req.headers.authorization;

        if (!header?.startsWith("Bearer ")) {
            next(new AppError(401, "UNAUTHORIZED", "Se requiere un token de acceso"));
            return;
        }

        const token = header.slice("Bearer ".length).trim();

        let payload: AccessTokenPayload;
        try {
            payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
        } catch {
            next(new AppError(401, "UNAUTHORIZED", "El token de acceso no es válido o expiró"));
            return;
        }

        if (payload.type !== "access" || !payload.sub) {
            next(new AppError(401, "UNAUTHORIZED", "El token de acceso no es válido o expiró"));
            return;
        }

        try {
            req.user = users.findById(Number(payload.sub));
        } catch {
            next(new AppError(401, "UNAUTHORIZED", "El usuario del token ya no existe"));
            return;
        }

        next();
    };
};

export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
    return (req, _res, next): void => {
        if (!req.user) {
            next(new AppError(401, "UNAUTHORIZED", "Se requiere un token de acceso"));
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            next(new AppError(403, "FORBIDDEN", "No tenés permisos para acceder a este recurso"));
            return;
        }

        next();
    };
};
