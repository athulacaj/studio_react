import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('Invalid environment variables:', envVars.error.format());
  process.exit(1);
}

export const config = {
  PORT: parseInt(envVars.data.PORT, 10),
  NODE_ENV: envVars.data.NODE_ENV,
  DATABASE_URL: envVars.data.DATABASE_URL,
};
