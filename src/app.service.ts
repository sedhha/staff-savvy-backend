import { HttpException, Injectable } from '@nestjs/common';
import { User, Session } from '@supabase/supabase-js';
import { auth } from './utils/admin';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  async loginUser(
    email: string,
    password: string,
  ): Promise<{
    message?: string;
    data?: { user: User; session: Session };
  } | void> {
    return auth
      .signInWithPassword({
        email,
        password,
      })
      .then((response) => {
        const { data, error } = response;
        if (error) throw new HttpException(error.message, error.status);
        return { data: { user: data.user, session: data.session } };
      });
  }
}
