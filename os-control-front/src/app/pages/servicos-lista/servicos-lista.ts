import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ServicoLista } from '../../models/servico.model';
import { AuthService } from '../../services/auth.service';
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
  servicos: ServicoLista[] = [];

  constructor(private router: Router, private servicosService: ServicosService, private authService: AuthService) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  ngOnInit() {
    this.atualizarServicos();
  }

  get servicosFiltrados(): ServicoLista[] {
    const nome = this.filtroNome.trim().toLowerCase();

    return this.servicos.filter((servico) => !nome || servico.nome.toLowerCase().includes(nome));
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.servicosFiltrados.length) });
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }

  excluirServico(id: string) {
    if (!window.confirm('Deseja excluir servico?')) {
      return;
    }

    this.servicosService.excluir(id);
    this.atualizarServicos();
  }

  private atualizarServicos() {
    this.servicos = this.servicosService.listarLista();
  }
}
