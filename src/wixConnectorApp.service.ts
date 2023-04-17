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
  isAdmin: z.boolean().optional(),
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
        const employeeID = data.user.user_metadata.employeeCode;
        if (error) throw new HttpException(error.message, error.status);
        if (!employeeID)
          throw new HttpException(
            'User not found. Kindly contact the administrator or reset the account.',
            HttpStatus.BAD_REQUEST,
          );
        return Admin.from(tables.userRequestHistory)
          .select(tableFields.userRequestHistory.accessID)
          .eq(tableFields.userRequestHistory.userID, employeeID)
          .then((res) => {
            if (res.error)
              throw new HttpException(res.error.message, HttpStatus.NOT_FOUND);
            return {
              data: {
                user: data.user,
                session: data.session,
                access: res.data.map(
                  (item) => item[tableFields.userRequestHistory.accessID],
                ),
              },
            };
          });
      });
  }
  async signUpUser(payload: ISignUpUser): Promise<{
    message?: string;
    error: boolean;
  } | void> {
    const response = zodValidator<ISignUpUser>(signupUserSchema, payload);
    if (response.isError)
      throw new HttpException(
        (response as { message: string }).message,
        HttpStatus.BAD_REQUEST,
      );
    const { isAdmin, employeeCode } = response as ISignUpUser;

    return this.registerUserProcess(
      isAdmin,
      employeeCode,
      response as ISignUpUser,
    );
  }
  async registerUserProcess(
    isAdmin: boolean,
    magicCode: string,
    user: ISignUpUser,
  ) {
    const headerFilterID = isAdmin
      ? tableFields.magicCodeTables.orgID
      : tableFields.magicCodeEmployeeTable.employeeCode;
    const tableName = isAdmin
      ? tables.magicCodeTables
      : tables.magicCodeEmployeeTable;
    const fieldNameToUpdate = isAdmin
      ? tableFields.magicCodeTables.userUID
      : tableFields.magicCodeEmployeeTable.employeeUID;
    const { emailAddress, securePassword, firstName, lastName, employeeCode } =
      user;
    const remainingFields = isAdmin
      ? {}
      : {
          email: emailAddress,
          firstName,
          lastName,
          permissions: '',
          isActive: true,
        };
    return Admin.from(tableName)
      .select('*')
      .eq(headerFilterID, magicCode)
      .then(({ data, error }) => {
        if (error || !data?.length) {
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
          return auth
            .signUp({
              email: emailAddress,
              password: securePassword,
              options: {
                data: {
                  firstName: firstName,
                  lastName: lastName,
                  orgCode: (data[0] as IRegistrationTable).orgCode,
                  employeeCode: employeeCode,
                  orgAdmin: isAdmin,
                  email_confirm: true,
                },
              },
            })
            .then(({ data, error }) => {
              if (error)
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
              const { user } = data;
              return Admin.from(tableName)
                .update({
                  ...remainingFields,
                  [fieldNameToUpdate]: user.id,
                  registered: true,
                })
                .eq(headerFilterID, magicCode)
                .then(({ error }) => {
                  if (error) {
                    Admin.auth.admin.deleteUser(user.id);
                    throw new HttpException(
                      error.message,
                      HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                  }
                  const successMessage = isAdmin
                    ? 'Successfully created Org. You can go and start using Staff Savvyy'
                    : 'Successfully created Employee Account. You can go and start using Staff Savvyy';
                  return {
                    error: false,
                    message: successMessage,
                  };
                });
            });
        }
      });
  }
}
