import { z } from 'zod'

export const signupSchema = z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().optional(),
})

export type SignupInput = z.infer<typeof signupSchema>

export const loginSchema = z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
