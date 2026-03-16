import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

type PecaListaItem = {
  id: string;
  nome: string;
  valor: string;
};

@Component({
  selector: 'app-pecas-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './pecas-lista.html',
  styleUrl: './pecas-lista.css',
})
export class PecasLista {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  filtroId = '';
  readonly pecas = this.carregarPecas();

  constructor(private router: Router) {}

  get pecasFiltradas(): PecaListaItem[] {
    const nome = this.filtroNome.trim().toLowerCase();
    const id = this.filtroId.trim().toLowerCase();

    return this.pecas.filter((peca) => {
      const combinaNome = !nome || peca.nome.toLowerCase().includes(nome);
      const combinaId = !id || peca.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.pecasFiltradas.length) });
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  private carregarPecas(): PecaListaItem[] {
    const chaves = ['pecasCadastradas', 'pecas', 'cadastroPecas'];

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

        const pecas = dados
          .map((item, indice) => this.mapearPeca(item, indice))
          .filter((item): item is PecaListaItem => item !== null);

        if (pecas.length > 0) {
          return pecas;
        }
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
}
