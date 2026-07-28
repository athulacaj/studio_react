import { Request } from 'express';

export function getEffectiveUserId(req: Request, requestedUserId?: string): string | undefined {
    const user = req.user;
    if (!user) {
        throw new Error("User not authenticated");
    }

    if (user.role === 'Admin') {
        return requestedUserId;
    }

    // For non-admin, always force their own ID
    return user.userId;
}
