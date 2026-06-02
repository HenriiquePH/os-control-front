import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ServicoLista } from '../../models/servico.model';
import { AuthService } from '../../services/auth.service';
import { MensagemService } from '../../services/mensagem.service';
import { ServicosService } from '../../services/servicos.service';

@Component({
  selector: 'app-servicos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './servicos-lista.html',
  styleUrl: './servicos-lista.css',
})
export class ServicosLista implements OnInit {
  usuarioLogado: string = 'Usuario';
  filtroNome = '';
  filtroNomeAplicado = '';
  servicos: ServicoLista[] = [];

  constructor(
    private router: Router,
    private servicosService: ServicosService,
    private authService: AuthService,
    private mensagemService: MensagemService
  ) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  ngOnInit() {
    this.atualizarServicos();
  }

  get servicosFiltrados(): ServicoLista[] {
    const nome = this.filtroNomeAplicado.trim().toLowerCase();

    return this.servicos.filter((servico) => !nome || servico.nome.toLowerCase().includes(nome));
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.servicosFiltrados.length) });
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }

  aplicarFiltros() {
    this.filtroNomeAplicado = this.filtroNome;
  }

  async excluirServico(id: string) {
    const confirmado = await this.mensagemService.confirmar('Deseja excluir servico?', 'Excluir servico');

    if (!confirmado) {
      return;
    }

    this.servicosService.excluir(id).subscribe({
      next: () => this.atualizarServicos(),
      error: (erro) => console.error('Erro ao excluir servico no backend.', erro),
    });
  }

  private atualizarServicos() {
    this.servicosService.listarLista().subscribe({
      next: (servicos) => {
        this.servicos = servicos;
      },
      error: (erro) => {
        console.error('Erro ao carregar servicos do backend.', erro);
        this.servicos = [];
      },
    });
  }
}
