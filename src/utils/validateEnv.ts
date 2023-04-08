import { z } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('Environment Validation');
const envSchema = z.object({
  NODE_ENV: z.string(),
  PORT: z.string(),
  SUPERBASE_PROJECT_ID: z.string(),
  SUPERBASE_PUBLIC_CLIENT_ID: z.string(),
  SUPERBASE_PRIVATE_SERVICE_ROLE: z.string(),
});
export const ValidateEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  const { success } = parsed;
  if (!success) {
    logger.log('Env Variables = ', process.env);
    logger.error(JSON.stringify(parsed));
    throw new Error('Unable to find environment variables');
  } else logger.log('All Environment Variables Successfully Loaded');
};
