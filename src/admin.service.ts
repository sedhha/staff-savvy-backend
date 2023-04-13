import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Admin from './utils/admin';
import { tables, tableFields } from './utils/constants';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminAppService {
  async generateMagicLinkForEmployee(orgCode: string) {
    const id = uuidv4();
    return Admin.from(tables.magicCodeEmployeeTable)
      .insert([
        {
          [tableFields.magicCodeEmployeeTable.employeeCode]: id,
          [tableFields.magicCodeEmployeeTable.orgID]: orgCode,
        },
      ])
      .then(({ error }) => {
        if (error)
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        return { magicLink: id };
      });
  }
}
