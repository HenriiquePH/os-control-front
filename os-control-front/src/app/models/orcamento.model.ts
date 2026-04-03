export type DiaCalendario =
  | {
      data: Date;
      domingo: boolean;
      numero: number;
      selecionado: boolean;
    }
  | null;

export type AbaOrcamento = 'pecas' | 'servicos';

export interface ServicoSelecionado {
  id: string;
  nome: string;
  valor: number;
}

export interface PecaSelecionada {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrcamentoSalvo {
  id: string;
  nome: string;
  nomeOrcamento: string;
  dataAbertura: string;
  observacao: string;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
  valorTotal: string;
  total: number;
  cliente: string;
  nomeCliente: string;
  veiculo: string;
  modelo: string;
}

export interface OrcamentoListaItem {
  id: string;
  nome: string;
  valorTotal: string;
}

export interface OrcamentoImportacao {
  id: string;
  nome: string;
  cliente: string;
  veiculo: string;
  dataAbertura: string;
  observacao: string;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
}
