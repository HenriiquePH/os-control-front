export interface TecnicoFormulario {  // define a estrutura dos dados de um técnico para o formulário, contendo os campos necessários para criar ou editar um técnico
  nome: string;
  cpf: string;
  telefone: string;
  usuario: string;
  senha: string;
}

export interface TecnicoSalvo extends TecnicoFormulario { // define a estrutura dos dados de um técnico salvo, estendendo o formato do formulário e adicionando o campo de ID para identificar o técnico no backend
  id: string;
}

export interface TecnicoLista { // define a estrutura dos dados de um técnico para exibição na lista, contendo apenas os campos necessários para mostrar as informações do técnico na tabela
  id: string;
  nome: string;
  telefone: string;
}

export interface TecnicoApi { // define a estrutura dos dados de um técnico conforme retornado pelo backend, contendo os campos que o backend utiliza para representar um técnico
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  login: string;
  perfil: string;
}
