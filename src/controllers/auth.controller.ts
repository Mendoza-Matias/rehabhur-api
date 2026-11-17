import type { Request, Response } from "express";

import type { UserResponseDto } from "../dtos/user-response.dto.js";
import type { AuthResult, TokenPair } from "../models/auth.model.js";
import type {
    RefreshTokenDto,
    SigninDto,
    SignupDto,
} from "../schemas/auth.schema.js";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
    constructor(private readonly service: AuthService) { }

    signup = async (
        req: Request<{}, AuthResult, SignupDto>,
        res: Response<AuthResult>
    ): Promise<void> => {
        const result = await this.service.signup(req.body);
        res.status(201).json(result);
    };

    signin = async (
        req: Request<{}, AuthResult, SigninDto>,
        res: Response<AuthResult>
    ): Promise<void> => {
        const result = await this.service.signin(req.body);
        res.status(200).json(result);
    };

    refreshToken = (
        req: Request<{}, TokenPair, RefreshTokenDto>,
        res: Response<TokenPair>
    ): void => {
        const tokens = this.service.refresh(req.body.refreshToken);
        res.status(200).json(tokens);
    };

    logout = (
        req: Request<{}, void, RefreshTokenDto>,
        res: Response
    ): void => {
        this.service.logout(req.body.refreshToken);
        res.status(204).end();
    };

    profile = (
        req: Request,
        res: Response<UserResponseDto>
    ): void => {
        const user = this.service.getProfile(req.user!.id);
        res.status(200).json(user);
    };
}
