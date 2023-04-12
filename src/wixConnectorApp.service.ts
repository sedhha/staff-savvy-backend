import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, Session } from '@supabase/supabase-js';
import Admin, { auth } from './utils/admin';
import { z } from 'zod';
import { IRegistrationTable, ISignUpUser } from './wixConnectorApp.interface';
import { zodValidator } from './utils/zodValidator';
import { tables, tableFields } from './utils/constants';

const signupUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  emailAddress: z.string(),
  orgCode: z.string(),
  employeeCode: z.string(),
  securePassword: z.string(),
  isAdmin: z.boolean().nullable(),
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
  async signupAdmin(payload: ISignUpUser): Promise<{
    message?: string;
    error: boolean;
  } | void> {
    const response = zodValidator<ISignUpUser>(signupUserSchema, payload);
    if (response.isError)
      throw new HttpException(
        (response as { message: string }).message,
        HttpStatus.BAD_REQUEST,
      );
    const {
      isAdmin,
      emailAddress,
      employeeCode,
      orgCode,
      lastName,
      firstName,
      securePassword,
    } = response as ISignUpUser;

    if (!isAdmin)
      throw new HttpException(
        'Org employee registration not allowed with these set of credentials',
        HttpStatus.CONFLICT,
      );
    return Admin.from(tables.magicCodeTables)
      .select('*')
      .eq(tableFields.magicCodeTables.orgID, employeeCode)
      .then(({ data, error }) => {
        if (error) {
          throw new HttpException(
            'Invalid or Expired Magic Code. Please contact the administrator',
            HttpStatus.BAD_REQUEST,
          );
        } else if ((data[0] as IRegistrationTable).registered) {
          throw new HttpException(
            'Org already registered with the given magic Code. Please contact the administrator',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          auth
            .signUp({
              email: emailAddress,
              password: securePassword,
              options: {
                data: {
                  firstName: firstName,
                  lastName: lastName,
                  orgCode: orgCode,
                  employeeCode: employeeCode,
                  orgAdmin: false,
                  email_confirm: true,
                },
              },
            })
            .then(({ data, error }) => {
              if (error)
                throw new HttpException(
                  error.message,
                  HttpStatus.INTERNAL_SERVER_ERROR,
                );
              const { user } = data;
              Admin.from(tables.magicCodeTables)
                .update({
                  [tableFields.magicCodeTables.userUID]: user.id,
                })
                .eq(tableFields.magicCodeTables.orgID, employeeCode)
                .then(({ error }) => {
                  if (error)
                    throw new HttpException(
                      error.message,
                      HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                  return {
                    error: false,
                    message:
                      'Successfully created Org. You can go and start using Staff Savvyy',
                  };
                });
            });
        }
      });
  }
}
