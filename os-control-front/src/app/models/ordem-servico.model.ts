import { PecaSelecionada, ServicoSelecionado } from './orcamento.model';

export type DiaCalendario =
  | {
      data: Date;
      domingo: boolean;
      numero: number;
      selecionado: boolean;
    }
  | null;

export type AbaOs = 'pecas' | 'servicos';

export interface OrdemServicoSalva {
  id: string;
  numeroOrcamento: string;
  cliente: string;
  veiculo: string;
  status: string;
  tecnico: string;
  dataAbertura: string;
  observacao: string;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
  desconto: string;
  totalOs: string;
}

export interface OrdemServicoLista {
  id: string;
  dataAbertura: string;
  cliente: string;
  veiculo: string;
  status: string;
  tecnico: string;
}
