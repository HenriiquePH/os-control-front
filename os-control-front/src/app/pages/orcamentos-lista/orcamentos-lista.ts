import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

type OrcamentoListaItem = {
  id: string;
  nome: string;
  valorTotal: string;
};

@Component({
  selector: 'app-orcamentos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './orcamentos-lista.html',
  styleUrl: './orcamentos-lista.css',
})
export class OrcamentosLista {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  filtroId = '';
  readonly orcamentos = this.carregarOrcamentos();

  constructor(private router: Router) {}

  get orcamentosFiltrados(): OrcamentoListaItem[] {
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

  private carregarOrcamentos(): OrcamentoListaItem[] {
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
          .filter((item): item is OrcamentoListaItem => item !== null);

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
        valorTotal: 'R$335,00',
      },
    ];
  }

  private mapearOrcamento(item: unknown, indice: number): OrcamentoListaItem | null {
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

  private comoTexto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }

  private comoValor(valor: unknown): string {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }

    return typeof valor === 'string' ? valor.trim() : '';
  }
}
