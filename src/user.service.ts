import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Admin from './utils/admin';
import { tables, tableFields } from './utils/constants';
import { z } from 'zod';
import { IAccessFE, IAccessRequest } from './admin.interfaces';
import { zodErrorFormatter } from './utils/zodErrorFormatter';

const requestAccessSchema = z.object({
  remarks: z.string(),
  accessID: z.string(),
});

@Injectable()
export class UserAppService {
  async getAllCategories(orgCode: string) {
    return Admin.from(tables.accessTable)
      .select(
        `${tableFields.accessTable.primaryCategory},${tableFields.accessTable.secondaryCategory},${tableFields.accessTable.accessToken}`,
      )
      .eq(tableFields.accessTable.orgID, orgCode)
      .then(({ error, data }) => {
        if (error)
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        return data.reduce((acc, curr) => {
          const primaryCategory = curr[tableFields.accessTable.primaryCategory];
          const secondaryCategory =
            curr[tableFields.accessTable.secondaryCategory];
          const accessToken = curr[tableFields.accessTable.accessToken];
          const element = { label: secondaryCategory, value: accessToken };
          if (!acc[primaryCategory]) acc[primaryCategory] = [element];
          else acc[primaryCategory].push(element);

          return acc;
        }, {});
      });
  }

  async getMyAccess(orgCode: string, employeeCode: string) {
    return Admin.from(tables.userRequestHistory)
      .select('*')
      .eq(tableFields.userRequestHistory.orgID, orgCode)
      .eq(tableFields.userRequestHistory.userID, employeeCode)
      .then(({ error, data }) => {
        if (error)
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        return data;
      });
  }

  async addAnAccessRequest(
    orgCode: string,
    userID: string,
    payload: IAccessRequest,
  ) {
    try {
      const result = requestAccessSchema.parse(payload) as IAccessRequest;
      const { accessID, remarks } = result;
      return Admin.from(tables.accessTable)
        .select(
          `${tableFields.accessTable.primaryCategory},${tableFields.accessTable.secondaryCategory}`,
        )
        .eq(tableFields.accessTable.orgID, orgCode)
        .eq(tableFields.accessTable.accessToken, accessID)
        .then(({ data }) => {
          if (!data?.length)
            throw new HttpException(
              'No Record found for accessID: ' + accessID,
              HttpStatus.NOT_FOUND,
            );
          const { primaryCategory, secondaryCategory } =
            data[0] as unknown as IAccessFE;

          return Admin.from(tables.userRequestHistory)
            .select(tableFields.userRequestHistory.approved)
            .eq(tableFields.userRequestHistory.accessID, accessID)
            .eq(tableFields.userRequestHistory.orgID, orgCode)
            .eq(tableFields.userRequestHistory.userID, userID)
            .then(({ data, error }) => {
              if (!error && data.length)
                throw new HttpException(
                  `Already Existing Request for AccessID - ${accessID} by ${userID}. Org: ${orgCode}`,
                  HttpStatus.CONFLICT,
                );
              return Admin.from(tables.userRequestHistory)
                .insert([
                  {
                    [tableFields.userRequestHistory.approved]: false,
                    [tableFields.userRequestHistory.accessID]: accessID,
                    [tableFields.userRequestHistory.orgID]: orgCode,
                    [tableFields.userRequestHistory.remarks]: remarks,
                    [tableFields.userRequestHistory.userID]: userID,
                    [tableFields.userRequestHistory.primaryCategory]:
                      primaryCategory,
                    [tableFields.userRequestHistory.secondaryCategory]:
                      secondaryCategory,
                  },
                ])
                .then(({ error }) => {
                  if (error)
                    throw new HttpException(
                      error.message,
                      HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                  return;
                });
            });
        });
    } catch (err) {
      throw new HttpException(
        `${zodErrorFormatter(err.errors)}::'${payload}'`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
