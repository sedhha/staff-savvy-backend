import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Admin from './utils/admin';
import { tables, tableFields } from './utils/constants';

@Injectable()
export class AdminAppService {
  async generateMagicLinkForEmployee(orgCode: string) {
    const id = crypto.randomUUID();
    return Admin.from(tables.magicCodeEmployeeTable)
      .insert([
        {
          [tableFields.magicCodeEmployeeTable.employeeCode]: id,
          [tableFields.magicCodeEmployeeTable.orgID]: orgCode,
        },
      ])
      .then(({ data, error }) => {
        if (error || !data) {
          throw new HttpException(
            'Invalid or Expired Magic Code. Please contact the administrator',
            HttpStatus.BAD_REQUEST,
          );
        }
        return { magicLink: id, insertedData: data };
      });
  }
}
