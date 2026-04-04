import { Injectable } from '@angular/core';

import {
  OrcamentoImportacao,
  OrcamentoLista,
  OrcamentoSalvo,
  PecaSelecionada,
  ServicoSelecionado,
} from '../models/orcamento.model';

@Injectable({
  providedIn: 'root',
})
export class OrcamentosService {
  private readonly chavesStorage = ['orcamentosCadastrados', 'orcamentos', 'cadastroOrcamentos'];

  listar(): OrcamentoSalvo[] {
    for (const chave of this.chavesStorage) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as OrcamentoSalvo[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  listarLista(): OrcamentoLista[] {
    return this.listarBrutos()
      .map((item, indice) => this.mapearLista(item, indice))
      .filter((item): item is OrcamentoLista => item !== null);
  }

  listarImportacao(): OrcamentoImportacao[] {
    return this.listarBrutos()
      .map((item, indice) => this.mapearImportacao(item, indice))
      .filter((item): item is OrcamentoImportacao => item !== null);
  }

  buscarPorId(id: string): OrcamentoSalvo | undefined {
    return this.listar().find((item) => item.id === id);
  }

  buscarParaImportacao(id: string): OrcamentoImportacao | undefined {
    return this.listarImportacao().find((item) => item.id === id);
  }

  salvar(orcamento: OrcamentoSalvo) {
    const orcamentos = this.listar();
    const orcamentosAtualizados = orcamentos.some((item) => item.id === orcamento.id)
      ? orcamentos.map((item) => (item.id === orcamento.id ? orcamento : item))
      : [...orcamentos, orcamento];

    localStorage.setItem('orcamentosCadastrados', JSON.stringify(orcamentosAtualizados));
  }

  excluir(id: string) {
    const orcamentosAtualizados = this.listarBrutos().filter((orcamento) => this.obterId(orcamento) !== id);
    localStorage.setItem('orcamentosCadastrados', JSON.stringify(orcamentosAtualizados));
  }

  gerarProximoId() {
    const maiorId = this.listar().reduce((maior, item) => {
      const numero = Number.parseInt(item.id, 10);
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return String(maiorId + 1).padStart(2, '0');
  }

  private listarBrutos(): unknown[] {
    for (const chave of this.chavesStorage) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? dados : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  private mapearLista(item: unknown, indice: number): OrcamentoLista | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const registro = item as Record<string, unknown>;
    const nome = this.comoTexto(registro['nome'] ?? registro['nomeOrcamento'] ?? registro['descricao']);

    if (!nome) {
      return null;
    }

    return {
      id: this.comoTexto(registro['id'] ?? registro['codigo']) || String(indice + 1).padStart(2, '0'),
      nome,
      valorTotal: this.comoValor(registro['valorTotal'] ?? registro['total'] ?? registro['valor']),
    };
  }

  private mapearImportacao(item: unknown, indice: number): OrcamentoImportacao | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const registro = item as Record<string, unknown>;
    const nome = this.comoTexto(registro['nome'] ?? registro['nomeOrcamento'] ?? registro['descricao']);

    if (!nome) {
      return null;
    }

    return {
      id: this.comoTexto(registro['id'] ?? registro['codigo']) || String(indice + 1).padStart(2, '0'),
      nome,
      cliente: this.comoTexto(registro['cliente'] ?? registro['nomeCliente']) || 'Cliente',
      veiculo: this.comoTexto(registro['veiculo'] ?? registro['modelo']) || 'Veiculo',
      dataAbertura: this.comoTexto(registro['dataAbertura']) || '14/03/2026',
      observacao: this.comoTexto(registro['observacao']),
      servicos: this.comoListaServicos(registro['servicos']),
      pecas: this.comoListaPecas(registro['pecas']),
    };
  }

  private comoTexto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }

  private comoValor(valor: unknown): string {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }

    return typeof valor === 'string' ? valor.trim() : '';
  }

  private comoListaServicos(valor: unknown) {
    return Array.isArray(valor)
      ? valor.filter(
          (item): item is ServicoSelecionado =>
            !!item && typeof item === 'object' && typeof (item as { nome?: unknown }).nome === 'string'
        )
      : [];
  }

  private comoListaPecas(valor: unknown) {
    return Array.isArray(valor)
      ? valor.filter(
          (item): item is PecaSelecionada =>
            !!item && typeof item === 'object' && typeof (item as { nome?: unknown }).nome === 'string'
        )
      : [];
  }

  private obterId(item: unknown) {
    if (!item || typeof item !== 'object') {
      return '';
    }

    const registro = item as Record<string, unknown>;
    return this.comoTexto(registro['id'] ?? registro['codigo']);
  }
}
