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

  async getPendingGeneratedLinks(orgCode: string) {
    return Admin.from(tables.magicCodeEmployeeTable)
      .select(tableFields.magicCodeEmployeeTable.employeeCode)
      .eq(tableFields.magicCodeEmployeeTable.orgID, orgCode)
      .then(({ error, data }) => {
        if (error)
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        return data;
      });
  }

  async removeInviteByCode(orgCode: string, employeeCode: string) {
    return Admin.from(tables.magicCodeEmployeeTable)
      .delete()
      .eq(tableFields.magicCodeEmployeeTable.orgID, orgCode)
      .eq(tableFields.magicCodeEmployeeTable.employeeCode, employeeCode)
      .then(({ error, status }) => {
        console.log({ status });
        if (error)
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }
}
