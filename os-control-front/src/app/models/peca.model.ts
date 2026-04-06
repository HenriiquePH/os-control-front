export interface PecaFormulario {
  nome: string;
  valor: string;
}

export interface PecaApi {
  id: number;
  descricao: string;
  valorUnitario: number;
}

export interface PecaSalva {
  id: string;
  nome: string;
  valor: string;
  valorUnitario: number;
}

export interface PecaLista {
  id: string;
  nome: string;
  valor: string;
}
