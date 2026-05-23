export interface LoginData {
  email: string;
  senha: string;
}

type LoginSuccessResponse = {
  success: true;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      email_verified_at: string | null;
      role: string;
      subscription_type: string;
      avatar_url: string;
      deleted_at: null;
      created_at: string;
      updated_at: string;
    };
    access_token: string;
    refresh_token: string;
    token_type: "bearer";
    expires_in: number;
  };
};

// Retornado quando o login falha (credenciais inválidas ou e-mail não verificado)
type LoginErrorResponse = {
  success: false;
  message: string;
  // Presente apenas quando o e-mail ainda não foi verificado (HTTP 403)
  email_verified?: false;
  resend_endpoint?: string;
};

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  confirmaSenha: string;
}

// Backend retorna apenas os dados do usuário após o cadastro.
// Não retorna tokens — o usuário precisa verificar o e-mail primeiro.
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
  };
};

type ApiValidationErrors = Record<string, string[]>;

type RegisterErrorResponse = {
  success: false;
  message: string;
  errors?: ApiValidationErrors; // opcional: presente apenas em erros de validação (422)
};

export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;
