import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

type ServicoListaItem = {
  id: string;
  nome: string;
  valor: string;
};

@Component({
  selector: 'app-servicos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './servicos-lista.html',
  styleUrl: './servicos-lista.css',
})
export class ServicosLista {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  readonly servicos = this.carregarServicos();

  constructor(private router: Router) {}

  get servicosFiltrados(): ServicoListaItem[] {
    const nome = this.filtroNome.trim().toLowerCase();

    return this.servicos.filter((servico) => !nome || servico.nome.toLowerCase().includes(nome));
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.servicosFiltrados.length) });
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  private carregarServicos(): ServicoListaItem[] {
    const chaves = ['servicosCadastrados', 'servicos', 'cadastroServicos'];

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

        const servicos = dados
          .map((item, indice) => this.mapearServico(item, indice))
          .filter((item): item is ServicoListaItem => item !== null);

        if (servicos.length > 0) {
          return servicos;
        }
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
}
