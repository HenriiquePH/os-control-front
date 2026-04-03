export interface VeiculoCliente {
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

export interface NovoVeiculoFormulario {
  marca: string;
  placa: string;
  modelo: string;
  ano: string;
}

export interface ClienteSalvo extends ClienteFormulario {
  id: string;
  veiculos: VeiculoCliente[];
}

export interface ClienteListaItem {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  veiculo: string;
}
