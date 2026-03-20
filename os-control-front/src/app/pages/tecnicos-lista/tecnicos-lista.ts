import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

type TecnicoListaItem = {
  id: string;
  nome: string;
  telefone: string;
};

@Component({
  selector: 'app-tecnicos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './tecnicos-lista.html',
  styleUrl: './tecnicos-lista.css',
})
export class TecnicosLista {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  filtroId = '';
  tecnicos = this.carregarTecnicos();

  constructor(private router: Router) {}

  get tecnicosFiltrados(): TecnicoListaItem[] {
    const nome = this.filtroNome.trim().toLowerCase();
    const id = this.filtroId.trim().toLowerCase();

    return this.tecnicos.filter((tecnico) => {
      const combinaNome = !nome || tecnico.nome.toLowerCase().includes(nome);
      const combinaId = !id || tecnico.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.tecnicosFiltrados.length) });
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  excluirTecnico(id: string) {
    if (!window.confirm('Deseja excluir tecnico?')) {
      return;
    }

    this.tecnicos = this.tecnicos.filter((tecnico) => tecnico.id !== id);
    localStorage.setItem(
      'tecnicosCadastrados',
      JSON.stringify(this.carregarTecnicosCompletos().filter((tecnico) => this.obterIdTecnico(tecnico) !== id))
    );
  }

  private carregarTecnicos(): TecnicoListaItem[] {
    const chaves = ['tecnicosCadastrados', 'tecnicos', 'cadastroTecnicos'];

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

        const tecnicos = dados
          .map((item, indice) => this.mapearTecnico(item, indice))
          .filter((item): item is TecnicoListaItem => item !== null);

        if (tecnicos.length > 0) {
          return tecnicos;
        }
      } catch {
        continue;
      }
    }

    return [];
  }

  private carregarTecnicosCompletos(): unknown[] {
    const chaves = ['tecnicosCadastrados', 'tecnicos', 'cadastroTecnicos'];

    for (const chave of chaves) {
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

  private mapearTecnico(item: unknown, indice: number): TecnicoListaItem | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const registro = item as Record<string, unknown>;
    const nome = this.comoTexto(registro['nome'] ?? registro['nomeTecnico']);

    if (!nome) {
      return null;
    }

    return {
      id: this.comoTexto(registro['id'] ?? registro['codigo'] ?? registro['idTecnico']) || String(indice + 1).padStart(2, '0'),
      nome,
      telefone: this.comoTexto(registro['telefone'] ?? registro['celular'] ?? registro['fone']) || '--',
    };
  }

  private comoTexto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }

  private obterIdTecnico(item: unknown) {
    if (!item || typeof item !== 'object') {
      return '';
    }

    const registro = item as Record<string, unknown>;
    return this.comoTexto(registro['id'] ?? registro['codigo'] ?? registro['idTecnico']);
  }
}
