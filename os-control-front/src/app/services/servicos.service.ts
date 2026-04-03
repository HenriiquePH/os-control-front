import { Injectable } from '@angular/core';

import { ServicoListaItem, ServicoSalvo } from '../models/servico.model';

@Injectable({
  providedIn: 'root',
})
export class ServicosService {
  private readonly chavesStorage = ['servicosCadastrados', 'servicos', 'cadastroServicos'];

  listarSalvos(): ServicoSalvo[] {
    for (const chave of this.chavesStorage) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as ServicoSalvo[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  listarParaLista(): ServicoListaItem[] {
    return this.listarCompletos()
      .map((item, indice) => this.mapearServico(item, indice))
      .filter((item): item is ServicoListaItem => item !== null);
  }

  buscarPorId(id: string): ServicoSalvo | undefined {
    return this.listarSalvos().find((item) => item.id === id);
  }

  salvar(servico: ServicoSalvo) {
    const servicos = this.listarSalvos();
    const servicosAtualizados = servicos.some((item) => item.id === servico.id)
      ? servicos.map((item) => (item.id === servico.id ? servico : item))
      : [...servicos, servico];

    localStorage.setItem('servicosCadastrados', JSON.stringify(servicosAtualizados));
  }

  excluir(id: string) {
    const servicosAtualizados = this.listarCompletos().filter((servico) => this.obterIdServico(servico) !== id);
    localStorage.setItem('servicosCadastrados', JSON.stringify(servicosAtualizados));
  }

  gerarProximoId() {
    const maiorId = this.listarSalvos().reduce((maior, item) => {
      const numero = Number.parseInt(item.id, 10);
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return String(maiorId + 1).padStart(2, '0');
  }

  private listarCompletos(): unknown[] {
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

  private mapearServico(item: unknown, indice: number): ServicoListaItem | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const registro = item as Record<string, unknown>;
    const nome = this.comoTexto(registro['nome'] ?? registro['descricao'] ?? registro['nomeServico']);

    if (!nome) {
      return null;
    }

    return {
      id: this.comoTexto(registro['id'] ?? registro['codigo']) || String(indice + 1).padStart(2, '0'),
      nome,
      valor: this.comoValor(registro['valor'] ?? registro['preco']),
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

  private obterIdServico(item: unknown) {
    if (!item || typeof item !== 'object') {
      return '';
    }

    const registro = item as Record<string, unknown>;
    return this.comoTexto(registro['id'] ?? registro['codigo']);
  }
}
