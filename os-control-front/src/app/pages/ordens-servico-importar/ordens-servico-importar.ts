import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

type OrcamentoImportacao = {
  id: string;
  nome: string;
  cliente: string;
  veiculo: string;
  dataAbertura: string;
  observacao: string;
  servicos: Array<{ id: string; nome: string; valor: number }>;
  pecas: Array<{ id: string; nome: string; quantidade: number; valorUnitario: number; valorTotal: number }>;
};

@Component({
  selector: 'app-ordens-servico-importar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ordens-servico-importar.html',
  styleUrl: './ordens-servico-importar.css',
})
export class OrdensServicoImportar {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  filtroId = '';
  readonly orcamentos = this.carregarOrcamentos();

  constructor(private router: Router) {}

  get orcamentosFiltrados(): OrcamentoImportacao[] {
    const nome = this.filtroNome.trim().toLowerCase();
    const id = this.filtroId.trim().toLowerCase();

    return this.orcamentos.filter((orcamento) => {
      const combinaNome = !nome || orcamento.nome.toLowerCase().includes(nome);
      const combinaId = !id || orcamento.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.orcamentosFiltrados.length) });
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  private carregarOrcamentos(): OrcamentoImportacao[] {
    const chaves = ['orcamentosCadastrados', 'orcamentos', 'cadastroOrcamentos'];

    for (const chave of chaves) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);

        if (!Array.isArray(dados)) {
          continue;
        }

        const orcamentos = dados
          .map((item, indice) => this.mapearOrcamento(item, indice))
          .filter((item): item is OrcamentoImportacao => item !== null);

        if (orcamentos.length > 0) {
          return orcamentos;
        }
      } catch {
        continue;
      }
    }

    return [
      {
        id: '01',
        nome: 'Orcamento Joao de Souza Corolla',
        cliente: 'Joao de Souza',
        veiculo: 'Corolla',
        dataAbertura: '14/03/2026',
        observacao: '',
        servicos: [{ id: '01', nome: 'Revisao geral', valor: 185 }],
        pecas: [{ id: '01', nome: 'Filtro de oleo', quantidade: 1, valorUnitario: 150, valorTotal: 150 }],
      },
    ];
  }

  private mapearOrcamento(item: unknown, indice: number): OrcamentoImportacao | null {
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
      servicos: [],
      pecas: [],
    };
  }

  private comoTexto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }
}
