import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Admin from './utils/admin';
import { tables, tableFields } from './utils/constants';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { IAccessFE } from './admin.interfaces';
import { zodErrorFormatter } from './utils/zodErrorFormatter';
let i = 0;
function* accessGeneratorId() {
  while (true) {
    yield i++;
  }
}

const accessZodSchema = z.array(
  z.object({
    primaryCategory: z.string(),
    secondaryCategory: z.string(),
    description: z.string(),
  }),
);
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
      .then(({ error }) => {
        if (error)
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  async getAllAccessByOrgID(orgCode: string) {
    return Admin.from(tables.accessTable)
      .select(
        `${tableFields.accessTable.primaryCategory},${tableFields.accessTable.secondaryCategory},${tableFields.accessTable.disabled},${tableFields.accessTable.description},${tableFields.accessTable.tokenElement}`,
      )
      .eq(tableFields.magicCodeEmployeeTable.orgID, orgCode)
      .then(({ error, data }) => {
        if (error)
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        const finalData = (data as unknown as IAccessFE[]).reduce(
          (acc, curr) => {
            acc.primaryCategories.push({
              label: curr.primaryCategory,
              value: curr.primaryCategory,
            });
            acc.secondaryCategories.push({
              label: curr.secondaryCategory,
              value: curr.secondaryCategory,
            });
            return acc;
          },
          { primaryCategories: [], secondaryCategories: [] },
        );
        return { data, categories: finalData };
      });
  }

  async addAccessToOrg(orgCode: string, payload: IAccessFE[]) {
    try {
      const result = accessZodSchema.parse(payload) as IAccessFE[];
      const id = accessGeneratorId().next().value;
      const insertionData = result.map((item) => {
        const { primaryCategory, secondaryCategory, description } = item;
        return {
          [tableFields.accessTable.orgID]: orgCode,
          [tableFields.accessTable.disabled]: false,
          [tableFields.accessTable.primaryCategory]: primaryCategory,
          [tableFields.accessTable.secondaryCategory]: secondaryCategory,
          [tableFields.accessTable.description]: description,
          [tableFields.accessTable
            .tokenElement]: `${primaryCategory.toLowerCase()}:${secondaryCategory.toLowerCase()}`,
          [tableFields.accessTable.accessToken]: id,
        };
      });
      return Admin.from(tables.accessTable)
        .insert(insertionData)
        .then(({ error, data }) => {
          if (error) {
            console.log('Error = ', error);
            if (error.code === '23505')
              throw new HttpException(
                'Please try renaming the secondary category. As the given access already exists!',
                HttpStatus.CONFLICT,
              );
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
          }
          return data;
        });
    } catch (error) {
      throw new HttpException(
        `${zodErrorFormatter(error.errors)}::'${payload}'`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
