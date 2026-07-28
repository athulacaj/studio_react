import { Response } from 'express'

export interface SessionInfo {
    sessionId: string
    expiresAt: string
}

/**
 * Common function to set the authentication cookie.
 * In development, it uses 'lax' sameSite to allow cross-origin communication
 * from different URLs (like a hosted IP or localhost:3000).
 */
export const setAuthCookie = (res: Response, session: SessionInfo) => {
    const isProduction = process.env.NODE_ENV === "production";
    const domain = process.env.DOMAIN_NAME;

    res.cookie("sessionId", session.sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        domain: isProduction ? "." + domain : undefined,
        expires: new Date(session.expiresAt),
    });
};

/**
 * Common function to clear the authentication cookie during logout.
 */
export const clearAuthCookie = (res: Response) => {
    res.clearCookie('sessionId', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: '.neuratrialdev.online',
        path: '/',
    });
}