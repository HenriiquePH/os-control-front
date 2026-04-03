import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { OrcamentoImportacao } from '../../models/orcamento.model';
import { OrcamentosService } from '../../services/orcamentos.service';

@Component({
  selector: 'app-ordens-servico-importar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ordens-servico-importar.html',
  styleUrl: './ordens-servico-importar.css',
})
export class OrdensServicoImportar implements OnInit {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  filtroId = '';
  orcamentos: OrcamentoImportacao[] = [];

  constructor(private router: Router, private orcamentosService: OrcamentosService) {}

  ngOnInit() {
    this.orcamentos = this.orcamentosService.listarParaImportacao();
  }

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
}
