import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

import {
    ACCESS_TOKEN_TTL,
    JWT_SECRET,
    REFRESH_TOKEN_TTL,
    REFRESH_TOKEN_TTL_MS,
} from "../config/jwt.js";
import { toUserResponseDto, type UserResponseDto } from "../dtos/user-response.dto.js";
import type {
    AuthResult,
    RefreshTokenPayload,
    StoredRefreshToken,
    TokenPair,
} from "../models/auth.model.js";
import type { User } from "../models/user.model.js";
import type { SigninDto, SignupDto } from "../schemas/auth.schema.js";
import { AppError } from "../utils/AppError.js";
import { UserService } from "./user.service.js";

export class AuthService {
    // Al ser en memoria, los refresh tokens se pierden al reiniciar el proceso.
    private readonly refreshTokens = new Map<string, StoredRefreshToken>();

    constructor(private readonly users: UserService) { }

    async signup(data: SignupDto): Promise<AuthResult> {
        // El registro público siempre crea pacientes.
        const user = await this.users.create({ ...data, role: "paciente" });
        return this.issueSession(user);
    }

    async signin(data: SigninDto): Promise<AuthResult> {
        const user = await this.users.validateCredentials(data.email, data.password);
        return this.issueSession(toUserResponseDto(user));
    }

    refresh(refreshToken: string): TokenPair {
        const payload = this.verifyRefreshToken(refreshToken);
        const stored = this.refreshTokens.get(payload.jti);

        if (!stored || stored.userId !== Number(payload.sub) || stored.expiresAt <= Date.now()) {
            throw new AppError(
                401,
                "INVALID_REFRESH_TOKEN",
                "El refresh token no es válido o expiró"
            );
        }

        // Rotación: el token usado deja de ser válido.
        this.refreshTokens.delete(payload.jti);

        let user: UserResponseDto;
        try {
            user = this.users.findById(Number(payload.sub));
        } catch {
            throw new AppError(
                401,
                "INVALID_REFRESH_TOKEN",
                "El refresh token no es válido o expiró"
            );
        }

        return {
            accessToken: this.signAccessToken(user),
            refreshToken: this.signRefreshToken(user),
        };
    }

    logout(refreshToken: string): void {
        try {
            const payload = this.verifyRefreshToken(refreshToken);
            this.refreshTokens.delete(payload.jti);
        } catch {
            // Un token inválido o expirado ya no permite iniciar sesión.
        }
    }

    getProfile(userId: number): UserResponseDto {
        return this.users.findById(userId);
    }

    private issueSession(user: UserResponseDto): AuthResult {
        return {
            user,
            accessToken: this.signAccessToken(user),
            refreshToken: this.signRefreshToken(user),
        };
    }

    private signAccessToken(user: UserResponseDto): string {
        return jwt.sign(
            { type: "access", role: user.role },
            JWT_SECRET,
            { subject: String(user.id), expiresIn: ACCESS_TOKEN_TTL }
        );
    }

    private signRefreshToken(user: UserResponseDto): string {
        const jti = randomUUID();
        const token = jwt.sign(
            { type: "refresh" },
            JWT_SECRET,
            {
                subject: String(user.id),
                jwtid: jti,
                expiresIn: REFRESH_TOKEN_TTL,
            }
        );

        this.removeExpiredTokens();
        this.refreshTokens.set(jti, {
            userId: user.id,
            expiresAt: Date.now() + REFRESH_TOKEN_TTL_MS,
        });

        return token;
    }

    private verifyRefreshToken(token: string): RefreshTokenPayload {
        let payload: RefreshTokenPayload;

        try {
            payload = jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
        } catch {
            throw new AppError(
                401,
                "INVALID_REFRESH_TOKEN",
                "El refresh token no es válido o expiró"
            );
        }

        if (payload.type !== "refresh" || !payload.sub || !payload.jti) {
            throw new AppError(
                401,
                "INVALID_REFRESH_TOKEN",
                "El refresh token no es válido o expiró"
            );
        }

        return payload;
    }

    private removeExpiredTokens(): void {
        const now = Date.now();
        for (const [jti, token] of this.refreshTokens) {
            if (token.expiresAt <= now) {
                this.refreshTokens.delete(jti);
            }
        }
    }
}
