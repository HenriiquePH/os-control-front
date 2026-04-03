import { Injectable } from '@angular/core';

import { PecaListaItem, PecaSalva } from '../models/peca.model';

@Injectable({
  providedIn: 'root',
})
export class PecasService {
  private readonly chavesStorage = ['pecasCadastradas', 'pecas', 'cadastroPecas'];

  listarSalvas(): PecaSalva[] {
    for (const chave of this.chavesStorage) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as PecaSalva[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  listarParaLista(): PecaListaItem[] {
    return this.listarCompletas()
      .map((item, indice) => this.mapearPeca(item, indice))
      .filter((item): item is PecaListaItem => item !== null);
  }

  buscarPorId(id: string): PecaSalva | undefined {
    return this.listarSalvas().find((item) => item.id === id);
  }

  salvar(peca: PecaSalva) {
    const pecas = this.listarSalvas();
    const pecasAtualizadas = pecas.some((item) => item.id === peca.id)
      ? pecas.map((item) => (item.id === peca.id ? peca : item))
      : [...pecas, peca];

    localStorage.setItem('pecasCadastradas', JSON.stringify(pecasAtualizadas));
  }

  excluir(id: string) {
    const pecasAtualizadas = this.listarCompletas().filter((peca) => this.obterIdPeca(peca) !== id);
    localStorage.setItem('pecasCadastradas', JSON.stringify(pecasAtualizadas));
  }

  gerarProximoId() {
    const maiorId = this.listarSalvas().reduce((maior, item) => {
      const numero = Number.parseInt(item.id, 10);
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return String(maiorId + 1).padStart(2, '0');
  }

  private listarCompletas(): unknown[] {
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

  private mapearPeca(item: unknown, indice: number): PecaListaItem | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const registro = item as Record<string, unknown>;
    const nome = this.comoTexto(registro['nome'] ?? registro['descricao']);

    if (!nome) {
      return null;
    }

    return {
      id: this.comoTexto(registro['id'] ?? registro['codigo']) || String(indice + 1).padStart(2, '0'),
      nome,
      valor: this.comoValor(registro['valor'] ?? registro['valorUnitario'] ?? registro['preco']),
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

  private obterIdPeca(item: unknown) {
    if (!item || typeof item !== 'object') {
      return '';
    }

    const registro = item as Record<string, unknown>;
    return this.comoTexto(registro['id'] ?? registro['codigo']);
  }
}
