import { Injectable } from '@angular/core';

import { OrdemServicoLista, OrdemServicoSalva } from '../models/ordem-servico.model';

@Injectable({
  providedIn: 'root',
})
export class OrdensServicoService {
  private readonly chavesStorage = ['ordensServicoCadastradas', 'ordensServico'];

  listar(): OrdemServicoSalva[] {
    for (const chave of this.chavesStorage) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as OrdemServicoSalva[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  listarVisualizacao(): OrdemServicoLista[] {
    return this.listarBrutos()
      .map((item) => this.mapearVisualizacao(item))
      .filter((item): item is OrdemServicoLista => item !== null);
  }

  buscarPorId(id: string): OrdemServicoSalva | undefined {
    return this.listar().find((item) => item.id === id);
  }

  salvar(ordemServico: OrdemServicoSalva) {
    const ordens = this.listar();
    const ordensAtualizadas = ordens.some((item) => item.id === ordemServico.id)
      ? ordens.map((item) => (item.id === ordemServico.id ? ordemServico : item))
      : [...ordens, ordemServico];

    localStorage.setItem('ordensServicoCadastradas', JSON.stringify(ordensAtualizadas));
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

  private mapearVisualizacao(item: unknown): OrdemServicoLista | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const registro = item as Record<string, unknown>;
    const cliente = this.comoTexto(registro['cliente'] ?? registro['nomeCliente']);

    if (!cliente) {
      return null;
    }

    return {
      id: this.comoTexto(registro['id'] ?? registro['numeroOs']) || '--',
      dataAbertura: this.comoTexto(registro['dataAbertura']) || '--',
      cliente,
      veiculo: this.comoTexto(registro['veiculo']) || '--',
      status: this.comoTexto(registro['status']) || '--',
      tecnico: this.comoTexto(registro['tecnico']) || '--',
    };
  }

  private comoTexto(valor: unknown) {
    return typeof valor === 'string' ? valor.trim() : '';
  }
}
