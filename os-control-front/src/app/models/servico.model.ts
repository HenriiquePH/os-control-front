export interface ServicoFormulario { // define a estrutura dos dados de um serviço para o formulário, contendo os campos necessários para criar ou editar um serviço
  nome: string;
  valor: string;
}

export interface ServicoApi { //  define a estrutura dos dados de um serviço conforme retornado pelo backend, contendo os campos que o backend utiliza para representar um serviço
  id: number;
  descricao: string;
  valor: number;
}

export interface ServicoSalvo {  // define a estrutura dos dados de um serviço salvo, estendendo o formato do formulário e adicionando o campo de ID para identificar o serviço no backend, além de manter o valor numérico para edição
  id: string;
  nome: string;
  valor: string;
  preco: number;
}

export interface ServicoLista { // define a estrutura dos dados de um serviço para exibição na lista, contendo apenas os campos necessários para mostrar as informações do serviço na tabela, formatando o valor como moeda
  id: string;
  nome: string;
  valor: string;
}
