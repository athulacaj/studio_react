import * as bcrypt from 'bcrypt'
import { SignupInput, LoginInput } from '../validators/auth-validator'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '../db/drizzle'
import { ConflictError, UnauthorizedError } from '../utils/errors'
import { users, authAccounts, sessions } from '../db/schema'

export class AuthService {
    async signup(data: SignupInput) {
        // Check if user already exists
        const existingUsers = await db.select().from(users).where(eq(users.email, data.email))
        if (existingUsers.length > 0) {
            throw new ConflictError('User with this email already exists')
        }

        // Hash password
        const saltRounds = 12
        const passwordHash = await bcrypt.hash(data.password, saltRounds)

        // Insert within a transaction
        return await db.transaction(async (tx) => {
            const [newUser] = await tx
                .insert(users)
                .values({
                    email: data.email,
                    name: data.name,
                    role: 'User',
                })
                .returning()

            await tx
                .insert(authAccounts)
                .values({
                    userId: newUser.userId,
                    provider: 'local',
                    providerAccountId: data.email,
                    passwordHash,
                })

            return newUser
        })
    }

    async login(data: LoginInput, ipAddress?: string) {
        // Find user by email
        const existingUsers = await db.select().from(users).where(eq(users.email, data.email))
        const user = existingUsers[0]

        if (!user) {
            throw new UnauthorizedError('Invalid email or password')
        }

        // Find auth account
        const accounts = await db
            .select()
            .from(authAccounts)
            .where(
                and(
                    eq(authAccounts.userId, user.userId),
                    eq(authAccounts.provider, 'local')
                )
            )
        const account = accounts[0]

        if (!account || !account.passwordHash) {
            throw new UnauthorizedError('Invalid email or password')
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(data.password, account.passwordHash)
        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid email or password')
        }

        // Create session (e.g. valid for 7 days)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const [session] = await db
            .insert(sessions)
            .values({
                userId: user.userId,
                expiresAt: expiresAt.toISOString(),
                ipAddress,
            })
            .returning()

        return {
            user,
            session,
        }
    }

    async logout(sessionId: string) {
        await db.delete(sessions).where(eq(sessions.sessionId, sessionId))
    }

    async googleLogin(profile: any, ipAddress?: string) {
        const email = profile.emails?.[0]?.value
        if (!email) {
            throw new UnauthorizedError('No email associated with this Google account')
        }

        const user = await db.transaction(async (tx) => {
            // 1️⃣ Check if google account exists
            const existingAccount = await tx
                .select()
                .from(authAccounts)
                .innerJoin(users, eq(authAccounts.userId, users.userId))
                .where(
                    and(
                        eq(authAccounts.provider, 'google'),
                        eq(authAccounts.providerAccountId, profile.id)
                    )
                )

            if (existingAccount.length > 0) {
                return existingAccount[0].users
            }

            // 2️⃣ Check if user exists by email
            const existingUser = await tx
                .select()
                .from(users)
                .where(eq(users.email, email))

            let currentUser = existingUser[0]

            // 3️⃣ Create user if not exists
            if (!currentUser) {
                const [newUser] = await tx
                    .insert(users)
                    .values({
                        email,
                        name: profile.displayName,
                        role: 'User',
                    })
                    .returning()

                currentUser = newUser
            }

            // 4️⃣ Link google account (with conflict safety)
            await tx
                .insert(authAccounts)
                .values({
                    userId: currentUser.userId,
                    provider: 'google',
                    providerAccountId: profile.id,
                })
                .onConflictDoNothing()

            return currentUser
        })

        // 5️⃣ Create session
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const [session] = await db
            .insert(sessions)
            .values({
                userId: user.userId,
                expiresAt: expiresAt.toISOString(),
                ipAddress,
            })
            .returning()

        return { user, session }
    }

    async getActiveSession(sessionId: string) {
        const activeSessions = await db
            .select({
                session: sessions,
                user: users,
            })
            .from(sessions)
            .innerJoin(users, eq(sessions.userId, users.userId))
            .where(
                and(
                    eq(sessions.sessionId, sessionId),
                    gt(sessions.expiresAt, new Date().toISOString())
                )
            )

        const activeSession = activeSessions[0]

        if (!activeSession) {
            throw new UnauthorizedError('Session expired or invalid')
        }

        return activeSession
    }


}
