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

  //  o construtor recebe as dependências necessárias para o componente, como o Router para navegação, o ServicosService para acessar os dados dos serviços e o AuthService para obter informações do usuário logado e realizar logout
  constructor(private router: Router, private servicosService: ServicosService, private authService: AuthService) {
    this.usuarioLogado = this.authService.obterUsuario();
  }
  // o método ngOnInit é chamado automaticamente quando o componente é inicializado, e é responsável por carregar a lista de serviços do backend chamando o método atualizarServicos
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
  // método para excluir um serviço, que solicita confirmação do usuário, e se confirmado, chama o método de exclusão do ServicosService para remover o serviço do backend, e após excluir, atualiza a lista de serviços para refletir a exclusão, e em caso de erro, exibe uma mensagem no console
  excluirServico(id: string) {
    if (!window.confirm('Deseja excluir servico?')) {
      return;
    }
    // chama o método de exclusão do ServicosService para remover o serviço do backend, e após excluir, atualiza a lista de serviços para refletir a exclusão, e em caso de erro, exibe uma mensagem no console
    this.servicosService.excluir(id).subscribe({ 
      next: () => this.atualizarServicos(),
      error: (erro) => console.error('Erro ao excluir servico no backend.', erro),
    });
  }
  // método para atualizar a lista de serviços, fazendo uma requisição para o backend para obter os dados dos serviços, e atualizando a propriedade servicos com os dados retornados, ou exibindo um erro no console caso a requisição falhe
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
