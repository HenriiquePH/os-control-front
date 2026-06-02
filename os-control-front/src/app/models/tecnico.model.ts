export interface TecnicoFormulario {
  nome: string;
  cpf: string;
  telefone: string;
  usuario: string;
  senha: string;
}

export interface TecnicoSalvo extends TecnicoFormulario {
  id: string;
}

export interface TecnicoLista {
  id: string;
  nome: string;
  telefone: string;
}

export interface TecnicoApi {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  login: string;
  perfil: string;
}
