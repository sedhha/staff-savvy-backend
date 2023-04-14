interface ISignUpUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  orgCode: string;
  employeeCode: string;
  securePassword: string;
  isAdmin?: boolean;
}
interface ISupaBaseUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  phone: string;
  confirmation_sent_at: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: {
    employeeCode: string;
    firstName: string;
    lastName: string;
    orgAdmin: boolean;
    orgCode: string;
  };
  identities: {
    id: string;
    user_id: string;
    identity_data: {
      email: string;
      sub: string;
    };
    provider: string;
    last_sign_in_at: string;
    created_at: string;
    updated_at: string;
  }[];
  created_at: string;
  updated_at: string;
}

interface ISupaBaseSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    phone: string;
    confirmation_sent_at: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: {
      provider: string;
      providers: string[];
    };
    user_metadata: {
      employeeCode: string;
      firstName: string;
      lastName: string;
      orgAdmin: boolean;
      orgCode: string;
    };
    identities: {
      id: string;
      user_id: string;
      identity_data: {
        email: string;
        sub: string;
      };
      provider: string;
      last_sign_in_at: string;
      created_at: string;
      updated_at: string;
    }[];
    created_at: string;
    updated_at: string;
  };
  expires_at: number;
}

interface IRegistrationTable {
  orgCode: string;
  employeeCode: string;
  employeeUID?: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  registered: boolean;
}

export { ISignUpUser, ISupaBaseUser, ISupaBaseSession, IRegistrationTable };
