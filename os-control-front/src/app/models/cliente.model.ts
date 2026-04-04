export interface Veiculo {
  id: string;
  marca: string;
  placa: string;
  modelo: string;
  ano: string;
}

export interface ClienteFormulario {
  nome: string;
  cpf: string;
  telefone: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento: string;
}

export interface NovoVeiculo {
  marca: string;
  placa: string;
  modelo: string;
  ano: string;
}

export interface ClienteSalvo extends ClienteFormulario {
  id: string;
  veiculos: Veiculo[];
}

export interface ClienteLista {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  veiculo: string;
}
