import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PecaLista } from '../../models/peca.model';
import { AuthService } from '../../services/auth.service';
import { PecasService } from '../../services/pecas.service';

@Component({ // define o componente Angular para a lista de peças, configurando o seletor, os módulos importados, o template e o estilo
  selector: 'app-pecas-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './pecas-lista.html',
  styleUrl: './pecas-lista.css',
})
export class PecasLista implements OnInit { // classe do componente que implementa a interface OnInit para executar código na inicialização do componente
  usuarioLogado: string = 'Usuario';
  filtroNome = '';
  filtroId = '';
  pecas: PecaLista[] = [];

  // o construtor recebe as dependências necessárias para o componente, como o Router para navegação, o PecasService para acessar os dados das peças e o AuthService para obter informações do usuário logado e realizar logout
  constructor(private router: Router, private pecasService: PecasService, private authService: AuthService) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  ngOnInit() { // método chamado automaticamente quando o componente é inicializado, responsável por carregar a lista de peças do backend
    this.atualizarPecas();
  }

  get pecasFiltradas(): PecaLista[] { // retorna a lista de peças filtrada com base no filtro de nome, comparando os valor dos filtros com os campos correspondentes de cada peça e retornando apenas as peças que combinam com os critérios de filtro
    const nome = this.filtroNome.trim().toLowerCase();
    const id = this.filtroId.trim().toLowerCase();

    return this.pecas.filter((peca) => { // verifica se a peça combina com os filtros de nome, o filtro sejam aplicados simultaneamente, e retornando apenas as peças que atendem aos critérios de filtro
      const combinaNome = !nome || peca.nome.toLowerCase().includes(nome);
      const combinaId = !id || peca.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] { // calcula o número de linhas vazias necessárias para preencher a tabela
    return Array.from({ length: Math.max(0, 9 - this.pecasFiltradas.length) });
  }

  sair() { 
    this.authService.sair();
    this.router.navigate(['/login']);
  }

  excluirPeca(id: string) { // solicita confirmação do usuário para excluir a peça, e se confirmado, chama o método de exclusão do PecasService para remover a peça do backend
    if (!window.confirm('Deseja excluir peca?')) {
      return;
    }

    this.pecasService.excluir(id).subscribe({ // após excluir, atualiza a lista de peças para refletir a exclusão, e em caso de erro, exibe uma mensagem no console
      next: () => this.atualizarPecas(),
      error: (erro) => console.error('Erro ao excluir peca no backend.', erro),
    });
  }

  private atualizarPecas() { // faz uma requisição para o backend para obter a lista de peças, e atualiza a propriedade pecas com os dados retornados, ou exibe um erro no console caso a requisição falhe
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
