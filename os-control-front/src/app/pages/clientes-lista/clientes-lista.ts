import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

type ClienteListaItem = {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  veiculo: string;
};

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './clientes-lista.html',
  styleUrl: './clientes-lista.css',
})
export class ClientesLista {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  filtroId = '';
  readonly clientes = this.carregarClientes();

  constructor(private router: Router) {}

  get clientesFiltrados(): ClienteListaItem[] {
    const nome = this.filtroNome.trim().toLowerCase();
    const id = this.filtroId.trim().toLowerCase();

    return this.clientes.filter((cliente) => {
      const combinaNome = !nome || cliente.nome.toLowerCase().includes(nome);
      const combinaId = !id || cliente.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 8 - this.clientesFiltrados.length) });
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  private carregarClientes(): ClienteListaItem[] {
    const chaves = ['clientesCadastrados', 'clientes', 'cadastroClientes'];

    for (const chave of chaves) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);

        if (!Array.isArray(dados) || dados.length === 0) {
          continue;
        }

        const clientes = dados
          .map((item, indice) => this.mapearCliente(item, indice))
          .filter((item): item is ClienteListaItem => item !== null);

        if (clientes.length > 0) {
          return clientes;
        }
      } catch {
        continue;
      }
    }

    return [
      {
        id: '01',
        nome: 'Joao de Souza',
        telefone: '(45) 9495-9896',
        cidade: 'Toledo',
        veiculo: 'Corolla',
      },
    ];
  }

  private mapearCliente(item: unknown, indice: number): ClienteListaItem | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const registro = item as Record<string, unknown>;
    const endereco = registro['endereco'];
    const enderecoObjeto = endereco && typeof endereco === 'object' ? (endereco as Record<string, unknown>) : null;
    const veiculo = registro['veiculo'];
    const veiculoObjeto = veiculo && typeof veiculo === 'object' ? (veiculo as Record<string, unknown>) : null;

    const nome = this.comoTexto(registro['nome'] ?? registro['nomeCliente']);

    if (!nome) {
      return null;
    }

    const id = this.comoTexto(registro['id'] ?? registro['codigo'] ?? registro['idCliente']) || String(indice + 1).padStart(2, '0');
    const telefone = this.comoTexto(registro['telefone'] ?? registro['celular'] ?? registro['fone']) || '--';
    const cidade = this.comoTexto(registro['cidade'] ?? enderecoObjeto?.['cidade']) || '--';
    const veiculoNome =
      this.comoTexto(registro['veiculoPrincipal'] ?? registro['modeloVeiculo'] ?? registro['modelo']) ||
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

  private comoTexto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }
}
