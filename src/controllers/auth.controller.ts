import type { Request, Response } from "express";

import {
    clearRefreshCookieOptions,
    REFRESH_COOKIE_NAME,
    refreshCookieOptions,
} from "../config/cookies.js";
import type { UserResponseDto } from "../dtos/user-response.dto.js";
import type {
    AuthResponse,
    AuthResult,
    RefreshResponse,
    TokenPair,
} from "../models/auth.model.js";
import type {
    RefreshTokenDto,
    SigninDto,
    SignupDto,
} from "../schemas/auth.schema.js";
import { AuthService } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";
import { isMobileClient, readRefreshToken } from "../utils/refreshToken.js";

export class AuthController {
    constructor(private readonly service: AuthService) { }

    signup = async (
        req: Request<{}, AuthResponse, SignupDto>,
        res: Response<AuthResponse>
    ): Promise<void> => {
        const result = await this.service.signup(req.body);
        this.sendSession(req, res, 201, result);
    };

    signin = async (
        req: Request<{}, AuthResponse, SigninDto>,
        res: Response<AuthResponse>
    ): Promise<void> => {
        const result = await this.service.signin(req.body);
        this.sendSession(req, res, 200, result);
    };

    refreshToken = (
        req: Request<{}, RefreshResponse, RefreshTokenDto>,
        res: Response<RefreshResponse>
    ): void => {
        const refreshToken = this.requireRefreshToken(req);
        const tokens = this.service.refresh(refreshToken);

        res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, refreshCookieOptions);
        res.status(200).json(this.toResponse(req, tokens));
    };

    logout = (
        req: Request<{}, void, RefreshTokenDto>,
        res: Response
    ): void => {
        const refreshToken = readRefreshToken(req);

        if (refreshToken) {
            this.service.logout(refreshToken);
        }

        res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions);
        res.status(204).end();
    };

    profile = (
        req: Request,
        res: Response<UserResponseDto>
    ): void => {
        const user = this.service.getProfile(req.user!.id);
        res.status(200).json(user);
    };

    private sendSession(
        req: Request,
        res: Response<AuthResponse>,
        status: number,
        result: AuthResult
    ): void {
        res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
        res.status(status).json({
            user: result.user,
            accessToken: result.accessToken,
            ...(isMobileClient(req) ? { refreshToken: result.refreshToken } : {}),
        });
    }

    private toResponse(req: Request, tokens: TokenPair): RefreshResponse {
        return {
            accessToken: tokens.accessToken,
            ...(isMobileClient(req) ? { refreshToken: tokens.refreshToken } : {}),
        };
    }

    private requireRefreshToken(req: Request): string {
        const refreshToken = readRefreshToken(req);

        if (!refreshToken) {
            throw new AppError(
                401,
                "INVALID_REFRESH_TOKEN",
                "El refresh token no es válido o expiró"
            );
        }

        return refreshToken;
    }
}
