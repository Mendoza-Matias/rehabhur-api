import type { JwtPayload } from "jsonwebtoken";

import type { PublicUser } from "./user.model.js";

export interface AccessTokenPayload extends JwtPayload {
    type: "access";
    sub: string;
}

export interface RefreshTokenPayload extends JwtPayload {
    type: "refresh";
    sub: string;
    jti: string;
}

export interface StoredRefreshToken {
    userId: number;
    expiresAt: number;
}

export interface AuthResult {
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
