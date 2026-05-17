export interface LoginRequest { // define a estrutura dos dados de login que serão enviados para o backend, contendo o login e a senha do usuário
  login: string;
  password: string;
}

export interface LoginResponse { // define a estrutura dos dados de resposta do backend após a tentativa de login, contendo o token de autenticação retornado pelo backend
  token: string;
}
