export const tables = {
  magicCodeTables: 'orgRegistration',
  magicCodeEmployeeTable: 'employeeRegistration',
  users: 'users',
};

export const tableFields = {
  magicCodeTables: {
    userUID: 'userUID',
    orgID: 'orgCode',
  },
  magicCodeEmployeeTable: {
    employeeCode: 'employeeCode',
    employeeUID: 'employeeUID',
    orgID: 'orgCode',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    permissions: 'permissions',
    isActive: 'isActive',
  },
  users: {
    userID: 'id',
  },
};
