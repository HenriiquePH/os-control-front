import { Injectable } from '@angular/core';

import { TecnicoLista, TecnicoSalvo } from '../models/tecnico.model';

@Injectable({
  providedIn: 'root',
})
export class TecnicosService {
  private readonly chavesStorage = ['tecnicosCadastrados', 'tecnicos', 'cadastroTecnicos'];

  listar(): TecnicoSalvo[] {
    for (const chave of this.chavesStorage) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as TecnicoSalvo[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  listarLista(): TecnicoLista[] {
    return this.listarBrutos()
      .map((item, indice) => this.mapearTecnico(item, indice))
      .filter((item): item is TecnicoLista => item !== null);
  }

  listarNomes(): string[] {
    return this.listarBrutos()
      .map((item) => this.mapearNomeTecnico(item))
      .filter((nome) => nome.length > 0);
  }

  buscarPorId(id: string): TecnicoSalvo | undefined {
    return this.listar().find((item) => item.id === id);
  }

  salvar(tecnico: TecnicoSalvo) {
    const tecnicos = this.listar();
    const tecnicosAtualizados = tecnicos.some((item) => item.id === tecnico.id)
      ? tecnicos.map((item) => (item.id === tecnico.id ? tecnico : item))
      : [...tecnicos, tecnico];

    localStorage.setItem('tecnicosCadastrados', JSON.stringify(tecnicosAtualizados));
  }

  excluir(id: string) {
    const tecnicosAtualizados = this.listarBrutos().filter((tecnico) => this.obterId(tecnico) !== id);
    localStorage.setItem('tecnicosCadastrados', JSON.stringify(tecnicosAtualizados));
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

  private mapearTecnico(item: unknown, indice: number): TecnicoLista | null {
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

  private mapearNomeTecnico(item: unknown) {
    if (!item || typeof item !== 'object') {
      return '';
    }

    const registro = item as Record<string, unknown>;
    return this.comoTexto(registro['nome'] ?? registro['usuario'] ?? registro['name']);
  }

  private obterId(item: unknown) {
    if (!item || typeof item !== 'object') {
      return '';
    }

    const registro = item as Record<string, unknown>;
    return this.comoTexto(registro['id'] ?? registro['codigo'] ?? registro['idTecnico']);
  }
}
