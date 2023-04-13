import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';
import { ISupaBaseUser } from './wixConnectorApp.interface';
@Injectable()
export class AdminAppMiddleware implements NestMiddleware {
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
    const { headers } = req;
    if (!headers.authorization || !headers.authorization?.includes('bearer '))
      throw new HttpException(
        'Missing Authorization token - ' + headers.authorization,
        HttpStatus.UNAUTHORIZED,
      );
    const token = headers.authorization.split('bearer ')[1];
    try {
      const user = verify(
        token,
        process.env.SUPABASE_PRIVATE_JWT_SECRET,
      ) as JwtPayload;

      const expired = user.exp;
      if (new Date() > new Date(expired * 1000))
        throw new HttpException(
          'Session Expired. Please login again!',
          HttpStatus.GONE,
        );
      if (!(user as ISupaBaseUser).user_metadata.orgAdmin)
        throw new HttpException(
          `${user?.user_metadata?.firstName} is not authorized to make this request: ${user?.user_metadata?.orgAdmin}`,
          HttpStatus.FORBIDDEN,
        );
      req.body.supabaseUser = user as ISupaBaseUser;
      return next();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
