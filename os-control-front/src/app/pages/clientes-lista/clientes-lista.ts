import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ClienteLista } from '../../models/cliente.model';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';

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
  clientes: ClienteLista[] = [];

  constructor(private router: Router, private clientesService: ClientesService, private authService: AuthService) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  ngOnInit() {
    this.atualizarClientes();
  }

  get clientesFiltrados(): ClienteLista[] {
    const nome = this.filtroNome.trim().toLowerCase();
    const id = this.filtroId.trim().toLowerCase();

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

  excluirCliente(id: string) {
    if (!window.confirm('Deseja excluir cliente?')) {
      return;
    }

    this.clientesService.excluir(id).subscribe({
      next: () => this.atualizarClientes(),
      error: (erro) => {
        console.error('Não foi possível excluir o cliente.', erro);
      },
    });
  }

  private atualizarClientes() {
    this.clientesService.listarLista().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (erro) => {
        console.error('Não foi possível carregar os clientes.', erro);
        this.clientes = [];
      },
    });
  }
}
