import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from './env'
import { AuthService } from '../services/AuthService'

const authService = new AuthService()

passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${env.API_URL}/auth/google/callback`,
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const ipAddress = req.ip || req.socket.remoteAddress
                const { user, session } = await authService.googleLogin(profile, ipAddress)
                return done(null, { user, session } as any)
            } catch (error) {
                return done(error as Error, undefined)
            }
        }
    )
)
export default passport
