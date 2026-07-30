import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  POSTGRESS_DATABASE_URL: z.string(),
  API_URL: z.string(),
  PORT: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  WEB_URL: z.string(),
  GOOGLE_DRIVE_API_KEY: z.string(),
  GOOGLE_DRIVE_CLIENT_ID: z.string(),
  GOOGLE_DRIVE_CLIENT_SECRET: z.string(),
  TOKEN_ENCRYPTION_KEY: z.string()

});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('Invalid environment variables:', envVars.error.format());
  process.exit(1);
}

export const env = {
  API_URL: envVars.data.API_URL,
  NODE_ENV: envVars.data.NODE_ENV,
  DATABASE_URL: envVars.data.DATABASE_URL,
  POSTGRESS_DATABASE_URL: envVars.data.POSTGRESS_DATABASE_URL,
  PORT: envVars.data.PORT,
  GOOGLE_CLIENT_ID: envVars.data.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: envVars.data.GOOGLE_CLIENT_SECRET,
  WEB_URL: envVars.data.WEB_URL,
  GOOGLE_DRIVE_API_KEY: envVars.data.GOOGLE_DRIVE_API_KEY,
  GOOGLE_DRIVE_CLIENT_ID: envVars.data.GOOGLE_DRIVE_CLIENT_ID,
  GOOGLE_DRIVE_CLIENT_SECRET: envVars.data.GOOGLE_DRIVE_CLIENT_SECRET,
  TOKEN_ENCRYPTION_KEY: envVars.data.TOKEN_ENCRYPTION_KEY,
};
