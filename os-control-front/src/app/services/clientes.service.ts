import { Injectable } from '@angular/core';

import { ClienteLista, ClienteSalvo } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private readonly chavesStorage = ['clientesCadastrados', 'clientes', 'cadastroClientes'];

  listar(): ClienteSalvo[] {
    for (const chave of this.chavesStorage) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as ClienteSalvo[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  listarLista(): ClienteLista[] {
    return this.listarBrutos()
      .map((item, indice) => this.mapearCliente(item, indice))
      .filter((item): item is ClienteLista => item !== null);
  }

  buscarPorId(id: string): ClienteSalvo | undefined {
    return this.listar().find((item) => item.id === id);
  }

  salvar(cliente: ClienteSalvo) {
    const clientes = this.listar();
    const clientesAtualizados = clientes.some((item) => item.id === cliente.id)
      ? clientes.map((item) => (item.id === cliente.id ? cliente : item))
      : [...clientes, cliente];

    localStorage.setItem('clientesCadastrados', JSON.stringify(clientesAtualizados));
  }

  excluir(id: string) {
    const clientesAtualizados = this.listarBrutos().filter((cliente) => this.obterId(cliente) !== id);
    localStorage.setItem('clientesCadastrados', JSON.stringify(clientesAtualizados));
  }

  gerarProximoId() {
    return String(this.listar().length + 1).padStart(2, '0');
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

  private mapearCliente(item: unknown, indice: number): ClienteLista | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const registro = item as Record<string, unknown>;
    const endereco = registro['endereco'];
    const enderecoObjeto = endereco && typeof endereco === 'object' ? (endereco as Record<string, unknown>) : null;
    const veiculo = registro['veiculo'];
    const veiculoObjeto = veiculo && typeof veiculo === 'object' ? (veiculo as Record<string, unknown>) : null;
    const veiculos = registro['veiculos'];
    const veiculosLista = Array.isArray(veiculos) ? veiculos : [];
    const nome = this.comoTexto(registro['nome'] ?? registro['nomeCliente']);

    if (!nome) {
      return null;
    }

    const id = this.comoTexto(registro['id'] ?? registro['codigo'] ?? registro['idCliente']) || String(indice + 1).padStart(2, '0');
    const telefone = this.comoTexto(registro['telefone'] ?? registro['celular'] ?? registro['fone']) || '--';
    const cidade = this.comoTexto(registro['cidade'] ?? enderecoObjeto?.['cidade']) || '--';
    const veiculoNome =
      this.comoTexto(registro['veiculoPrincipal'] ?? registro['modeloVeiculo'] ?? registro['modelo']) ||
      this.montarVeiculoLista(veiculosLista) ||
      this.montarVeiculo(veiculoObjeto) ||
      '--';

    return {
      id,
      nome,
      telefone,
      cidade,
      veiculo: veiculoNome,
    };
  }

  private montarVeiculo(veiculo: Record<string, unknown> | null): string {
    if (!veiculo) {
      return '';
    }

    const marca = this.comoTexto(veiculo['marca']);
    const modelo = this.comoTexto(veiculo['modelo']);

    return [marca, modelo].filter(Boolean).join(' ');
  }

  private montarVeiculoLista(veiculos: unknown[]) {
    const primeiroVeiculo = veiculos[0];

    if (!primeiroVeiculo || typeof primeiroVeiculo !== 'object') {
      return '';
    }

    const registro = primeiroVeiculo as Record<string, unknown>;
    const marca = this.comoTexto(registro['marca']);
    const modelo = this.comoTexto(registro['modelo']);

    return [marca, modelo].filter(Boolean).join(' ');
  }

  private comoTexto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }

  private obterId(item: unknown) {
    if (!item || typeof item !== 'object') {
      return '';
    }

    const registro = item as Record<string, unknown>;
    return this.comoTexto(registro['id'] ?? registro['codigo'] ?? registro['idCliente']);
  }
}
