import { User as DbUser, Session as DbSession } from '../db/schema'

declare global {
    namespace Express {
        interface User extends DbUser {}
        interface Request {
            session?: DbSession
            user?: User
        }
    }
}