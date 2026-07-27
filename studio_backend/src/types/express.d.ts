import { User as DbUser, Session as DbSession } from '../db/schema'

declare global {
    namespace Express {
        interface Request {
            session?: DbSession
        }
    }
}