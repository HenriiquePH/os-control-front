import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { OrcamentoLista } from '../../models/orcamento.model';
import { OrcamentosService } from '../../services/orcamentos.service';

@Component({
  selector: 'app-orcamentos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './orcamentos-lista.html',
  styleUrl: './orcamentos-lista.css',
})
export class OrcamentosLista implements OnInit {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  filtroId = '';
  orcamentos: OrcamentoLista[] = [];

  constructor(private router: Router, private orcamentosService: OrcamentosService) {}

  ngOnInit() {
    this.atualizarOrcamentos();
  }

  get orcamentosFiltrados(): OrcamentoLista[] {
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

  excluirOrcamento(id: string) {
    if (!window.confirm('Deseja excluir orcamento?')) {
      return;
    }

    this.orcamentosService.excluir(id);
    this.atualizarOrcamentos();
  }

  private atualizarOrcamentos() {
    this.orcamentos = this.orcamentosService.listarLista();
  }
}
