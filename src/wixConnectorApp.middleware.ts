import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class WixApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const wixApiKey = req.header('x-wix-api-key');

    if (!wixApiKey) {
      throw new HttpException(
        'Missing x-wix-api-key header',
        HttpStatus.FORBIDDEN,
      );
    }

    if (wixApiKey !== process.env.WIX_BACKEND_API_KEY) {
      throw new HttpException(
        'Invalid x-wix-api-key header',
        HttpStatus.FORBIDDEN,
      );
    }

    next();
  }
}
