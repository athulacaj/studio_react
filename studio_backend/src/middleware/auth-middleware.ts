import { Request, Response, NextFunction } from 'express'
import { UnauthorizedError } from '../utils/errors'
import { AuthService } from '../services/AuthService'

const authService = new AuthService()

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const notExcludedPaths = ['/me', '/study-list']
    if (!notExcludedPaths.includes(req.path)) {
        next()
        return
    }
    try {
        const sessionId = req.cookies.sessionId

        if (!sessionId) {
            throw new UnauthorizedError('Authentication required')
        }

        const activeSession = await authService.getActiveSession(sessionId)

        // Attach user to request object
        req.user = activeSession.user
        req.session = activeSession.session

        next()
    } catch (error) {
        next(error)
    }
}
