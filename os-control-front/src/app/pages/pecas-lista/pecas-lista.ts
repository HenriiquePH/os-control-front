import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PecaLista } from '../../models/peca.model';
import { AuthService } from '../../services/auth.service';
import { PecasService } from '../../services/pecas.service';

@Component({
  selector: 'app-pecas-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './pecas-lista.html',
  styleUrl: './pecas-lista.css',
})
export class PecasLista implements OnInit {
  usuarioLogado: string = 'Usuario';
  filtroNome = '';
  filtroId = '';
  pecas: PecaLista[] = [];

  constructor(private router: Router, private pecasService: PecasService, private authService: AuthService) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  ngOnInit() {
    this.atualizarPecas();
  }

  get pecasFiltradas(): PecaLista[] {
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
    this.authService.sair();
    this.router.navigate(['/login']);
  }

  excluirPeca(id: string) {
    if (!window.confirm('Deseja excluir peca?')) {
      return;
    }

    this.pecasService.excluir(id).subscribe({
      next: () => this.atualizarPecas(),
      error: (erro) => console.error('Erro ao excluir peca no backend.', erro),
    });
  }

  private atualizarPecas() {
    this.pecasService.listarLista().subscribe({
      next: (pecas) => {
        this.pecas = pecas;
      },
      error: (erro) => {
        console.error('Erro ao carregar pecas do backend.', erro);
        this.pecas = [];
      },
    });
  }
}
