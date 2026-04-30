import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TecnicoLista } from '../../models/tecnico.model';
import { AuthService } from '../../services/auth.service';
import { TecnicosService } from '../../services/tecnicos.service';

@Component({
  selector: 'app-tecnicos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './tecnicos-lista.html',
  styleUrl: './tecnicos-lista.css',
})

// o componente TecnicosLista é responsável por exibir a lista de técnicos, permitindo filtrar por nome e id, e também possibilitando a exclusão de técnicos, além de oferecer a funcionalidade de logout para o usuário logado. Ele utiliza os serviços de autenticação e de técnicos para obter os dados necessários e realizar as operações de exclusão, e gerencia o estado da lista de técnicos e dos filtros para exibição adequada na interface do usuário.
export class TecnicosLista implements OnInit {
  usuarioLogado: string = 'Usuario';
  filtroNome = '';
  filtroId = '';
  tecnicos: TecnicoLista[] = [];
  
  // o construtor recebe as dependências necessárias para o componente, como o Router para navegação, o TecnicosService para acessar os dados dos técnicos e o AuthService para obter informações do usuário logado e realizar logout
  constructor(private router: Router, private tecnicosService: TecnicosService, private authService: AuthService) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  ngOnInit() {
    this.atualizarTecnicos();
  }


  // retorna a lista de técnicos filtrada com base nos filtros de nome e id, comparando os valores dos filtros com os campos correspondentes de cada técnico e retornando apenas os técnicos que combinam com os critérios de filtro
  get tecnicosFiltrados(): TecnicoLista[] {
    const nome = this.filtroNome.trim().toLowerCase();
    const id = this.filtroId.trim().toLowerCase();

    return this.tecnicos.filter((tecnico) => {
      const combinaNome = !nome || tecnico.nome.toLowerCase().includes(nome);
      const combinaId = !id || tecnico.id.toLowerCase().includes(id);

      return combinaNome && combinaId; 
    });
  }

  // calcula o número de linhas vazias necessárias para preencher a tabela, garantindo que a tabela tenha um número mínimo de linhas mesmo quando a lista de técnicos filtrados for menor do que esse número, e retorna um array com o número de elementos correspondente às linhas vazias
  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.tecnicosFiltrados.length) });
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }
  
  // método para excluir um técnico, que solicita confirmação do usuário para excluir o técnico, e se confirmado, chama o método de exclusão do TecnicosService para remover o técnico do backend, e após excluir, atualiza a lista de técnicos para refletir a exclusão, e em caso de erro, exibe uma mensagem no console
  excluirTecnico(id: string) {
    if (!window.confirm('Deseja excluir tecnico?')) {
      return;
    }

    this.tecnicosService.excluir(id).subscribe({
      next: () => this.atualizarTecnicos(),
      error: (erro) => {
        console.error('Não foi possível excluir o técnico.', erro);
      },
    });
  }

  // método para atualizar a lista de técnicos, fazendo uma requisição para o backend para obter os dados dos técnicos, e atualizando a propriedade tecnicos com os dados retornados, ou exibindo um erro no console caso a requisição falhe
  private atualizarTecnicos() {
    this.tecnicosService.listarLista().subscribe({
      next: (tecnicos) => {
        this.tecnicos = tecnicos;
      },
      error: (erro) => {
        console.error('Não foi possível carregar os técnicos.', erro);
        this.tecnicos = [];
      },
    });
  }
}
