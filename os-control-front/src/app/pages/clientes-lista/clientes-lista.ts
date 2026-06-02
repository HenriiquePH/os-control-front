import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ClienteLista } from '../../models/cliente.model';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';
import { MensagemService } from '../../services/mensagem.service';

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './clientes-lista.html',
  styleUrl: './clientes-lista.css',
})
export class ClientesLista implements OnInit {
  usuarioLogado: string = 'Usuario';
  filtroNome = '';
  filtroId = '';
  filtroNomeAplicado = '';
  filtroIdAplicado = '';
  clientes: ClienteLista[] = [];

  constructor(
    private router: Router,
    private clientesService: ClientesService,
    private authService: AuthService,
    private mensagemService: MensagemService
  ) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  ngOnInit() {
    this.atualizarClientes();
  }

  get clientesFiltrados(): ClienteLista[] {
    const nome = this.filtroNomeAplicado.trim().toLowerCase();
    const id = this.filtroIdAplicado.trim().toLowerCase();

    return this.clientes.filter((cliente) => {
      const combinaNome = !nome || cliente.nome.toLowerCase().includes(nome);
      const combinaId = !id || cliente.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 8 - this.clientesFiltrados.length) });
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }

  aplicarFiltros() {
    this.filtroNomeAplicado = this.filtroNome;
    this.filtroIdAplicado = this.filtroId;
  }

  async excluirCliente(id: string) {
    const confirmado = await this.mensagemService.confirmar('Deseja excluir cliente?', 'Excluir cliente');

    if (!confirmado) {
      return;
    }

    this.clientesService.excluir(id).subscribe({
      next: () => this.atualizarClientes(),
      error: (erro) => {
        console.error('Nao foi possivel excluir o cliente.', erro);
      },
    });
  }

  private atualizarClientes() {
    this.clientesService.listarLista().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar os clientes.', erro);
        this.clientes = [];
      },
    });
  }
}
