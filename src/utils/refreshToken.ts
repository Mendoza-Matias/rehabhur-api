import type { Request } from "express";

import { REFRESH_COOKIE_NAME } from "../config/cookies.js";

const MOBILE_CLIENT = "mobile";

export const isMobileClient = (req: Request): boolean =>
    req.get("x-client-type")?.trim().toLowerCase() === MOBILE_CLIENT;

/**
 * Los clientes web reciben el refresh token en una cookie httpOnly. Los
 * clientes nativos (móvil/escritorio) pueden enviarlo en el body porque no
 * tienen un almacén de cookies seguro.
 */
export const readRefreshToken = (req: Request): string | undefined => {
    const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (typeof cookieToken === "string" && cookieToken.trim()) {
        return cookieToken.trim();
    }

    const bodyToken = (req.body as { refreshToken?: unknown } | undefined)?.refreshToken;

    return typeof bodyToken === "string" && bodyToken.trim() ? bodyToken.trim() : undefined;
};
