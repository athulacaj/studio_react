import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { setAuthCookie, clearAuthCookie } from '../utils/cookie'
import { AuthService } from '../services/AuthService'

const authService = new AuthService()

export class AuthController {
    signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await authService.signup(req.body)

            res.status(201).json({
                success: true,
                data: user,
            })
        } catch (error) {
            next(error)
        }
    }

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const ipAddress = req.ip || req.socket.remoteAddress
            const { user, session } = await authService.login(req.body, ipAddress)

            setAuthCookie(res, session)

            res.status(200).json({
                success: true,
                data: user,
            })
        } catch (error) {
            next(error)
        }
    }

    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (req.session) {
                await authService.logout(req.session.sessionId)
            }

            clearAuthCookie(res)

            res.status(200).json({
                success: true,
                data: null,
            })
        } catch (error) {
            next(error)
        }
    }

    googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { session } = req.user as any

            setAuthCookie(res, session)

            res.redirect(env.WEB_URL)
        } catch (error) {
            next(error)
        }
    }

    me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.status(200).json({
                success: true,
                data: req.user,
            })
        } catch (error) {
            next(error)
        }
    }
}

export const authController = new AuthController()
