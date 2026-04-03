import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PecaListaItem } from '../../models/peca.model';
import { PecasService } from '../../services/pecas.service';

@Component({
  selector: 'app-pecas-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './pecas-lista.html',
  styleUrl: './pecas-lista.css',
})
export class PecasLista implements OnInit {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  filtroId = '';
  pecas: PecaListaItem[] = [];

  constructor(private router: Router, private pecasService: PecasService) {}

  ngOnInit() {
    this.atualizarPecas();
  }

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

  excluirPeca(id: string) {
    if (!window.confirm('Deseja excluir peca?')) {
      return;
    }

    this.pecasService.excluir(id);
    this.atualizarPecas();
  }

  private atualizarPecas() {
    this.pecas = this.pecasService.listarParaLista();
  }
}
