export interface LoginData {
  email: string;
  senha: string;
}

type LoginSuccessResponse = {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: null;
    role: string;
    subscription_type: string;
    avatar_url: string;
    deleted_at: null;
    created_at: string;
    updated_at: string;
  };
  token: string;
};

type LoginErrorResponse = {
  message: string;
};

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  confirmaSenha: string;
}

type RegisterSuccessResponse = {
  success: true;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      avatar_url: string;
      created_at: string;
    };
    token: string;
  };
};

type ApiValidationErrors = Record<string, string[]>;

type RegisterErrorResponse = {
  success: false;
  message: string;
  errors: ApiValidationErrors;
};

export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;
