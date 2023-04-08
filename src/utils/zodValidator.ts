import { ZodSchema } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('Request Body Validation');

const zodValidator = <T>(
  schema: ZodSchema,
  payload: T,
): (T & { isError: boolean }) | { isError: boolean; message: any } => {
  const result = schema.safeParse(payload);
  if (result.success) return { ...result.data, isError: false };
  else {
    logger.error('Invalid Body => ', result);
    return { isError: true, message: result };
  }
};

export { zodValidator };
