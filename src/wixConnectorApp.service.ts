import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, Session } from '@supabase/supabase-js';
import { auth } from './utils/admin';
import { z } from 'zod';
import { ISignUpUser } from './wixConnectorApp.interface';
import { zodValidator } from './utils/zodValidator';

const signupUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  emailAddress: z.string(),
  orgCode: z.string(),
  employeeCode: z.string(),
  securePassword: z.string(),
});

@Injectable()
export class WixConnectorAppService {
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
  async signupUser(payload: ISignUpUser): Promise<{
    message?: string;
    data?: { user: User; session: Session };
  } | void> {
    const response = zodValidator<ISignUpUser>(signupUserSchema, payload);
    if (response.isError)
      throw new HttpException(
        (response as { message: string }).message,
        HttpStatus.BAD_REQUEST,
      );
    return auth
      .signUp({
        email: (response as ISignUpUser).emailAddress,
        password: (response as ISignUpUser).securePassword,
        options: {
          data: {
            firstName: (response as ISignUpUser).firstName,
            lastName: (response as ISignUpUser).lastName,
            orgCode: (response as ISignUpUser).orgCode,
            employeeCode: (response as ISignUpUser).employeeCode,
            orgAdmin: false,
            email_confirm: true,
          },
        },
      })
      .then((data) => data)
      .catch((error) => ({ message: error.message }));
  }
}
