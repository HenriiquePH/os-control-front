import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

type OrdemServicoResumo = {
  id: string;
  dataAbertura: string;
  cliente: string;
  veiculo: string;
  status: string;
  tecnico: string;
};

@Component({
  selector: 'app-ordens-servico-visualizar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ordens-servico-visualizar.html',
  styleUrl: './ordens-servico-visualizar.css',
})
export class OrdensServicoVisualizar {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroCliente = '';
  filtroTecnico = '';
  filtroStatus = '';
  readonly ordens = this.carregarOrdens();

  constructor(private router: Router) {}

  get ordensFiltradas(): OrdemServicoResumo[] {
    const cliente = this.filtroCliente.trim().toLowerCase();
    const tecnico = this.filtroTecnico.trim().toLowerCase();
    const status = this.filtroStatus.trim().toLowerCase();

    return this.ordens.filter((ordem) => {
      const combinaCliente = !cliente || ordem.cliente.toLowerCase().includes(cliente);
      const combinaTecnico = !tecnico || ordem.tecnico.toLowerCase().includes(tecnico);
      const combinaStatus = !status || ordem.status.toLowerCase().includes(status);

      return combinaCliente && combinaTecnico && combinaStatus;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.ordensFiltradas.length) });
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  private carregarOrdens(): OrdemServicoResumo[] {
    const chaves = ['ordensServicoCadastradas', 'ordensServico'];

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

        const ordens = dados
          .map((item) => this.mapearOrdem(item))
          .filter((item): item is OrdemServicoResumo => item !== null);

        if (ordens.length > 0) {
          return ordens;
        }
      } catch {
        continue;
      }
    }

    return [];
  }

  private mapearOrdem(item: unknown): OrdemServicoResumo | null {
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

  private comoTexto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }
}
