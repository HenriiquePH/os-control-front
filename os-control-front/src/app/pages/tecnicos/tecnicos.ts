import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TecnicoFormulario, TecnicoSalvo } from '../../models/tecnico.model';
import { TecnicosService } from '../../services/tecnicos.service';

@Component({
  selector: 'app-tecnicos',
  imports: [FormsModule, RouterLink],
  templateUrl: './tecnicos.html',
  styleUrl: './tecnicos.css',
})
export class Tecnicos implements OnInit {
  modoEdicao: boolean = false;
  tecnicoId: string = '';
  tecnico: TecnicoFormulario = {
    nome: '',
    cpf: '',
    telefone: '',
    usuario: '',
    senha: '',
  };

  constructor(private router: Router, private route: ActivatedRoute, private tecnicosService: TecnicosService) {}

  // o método ngOnInit é chamado automaticamente quando o componente é inicializado, e é responsável por verificar se há um ID de técnico nos parâmetros da rota para determinar se está em modo de edição ou cadastro, e carregar os dados do técnico correspondente caso esteja em modo de edição, ou preparar um novo cadastro caso contrário
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }
    // método para carregar os dados de um técnico existente, que recebe o ID do técnico, chama o método de busca por ID do TecnicosService para obter os dados do técnico do backend, e se a busca for bem-sucedida, preenche o formulário com os dados do técnico e define o modo de edição como verdadeiro, e em caso de erro, exibe uma mensagem no console
    this.carregarTecnico(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar Tecnico' : 'Cadastro de Tecnico';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar' : 'Cadastrar';
  }

  // método para salvar um técnico, que pega os dados do formulário, prepara para salvar, e chama o método de salvar do tecnicosService, e após salvar, retorna para a lista de técnicos, ou em caso de erro, exibe uma mensagem no console
  salvarTecnico() {
    const nome = this.tecnico.nome.trim();

    if (!nome) {
      return;
    }

    // prepara os dados do técnico para salvar, verificando se é um novo cadastro ou uma atualização, e fazendo a requisição POST ou PUT para o backend com os headers de autenticação
    const tecnicoSalvo: TecnicoSalvo = {
      id: this.tecnicoId,
      nome,
      cpf: this.tecnico.cpf.trim(),
      telefone: this.tecnico.telefone.trim(),
      usuario: this.tecnico.usuario.trim(),
      senha: this.tecnico.senha,
    };

    // chama o metodo de salvar do tecnicosService, e após salvar, retorna para a lista de técnicos, ou em caso de erro, exibe uma mensagem no console
    this.tecnicosService.salvar(tecnicoSalvo).subscribe({
      next: () => this.router.navigate(['/tecnicos']),
      error: (erro) => {
        console.error('Não foi possível salvar o técnico.', erro);
      },
    });
  }

  //  método para carregar os dados de um técnico existente, que recebe o ID do técnico, chama o método de busca por ID do TecnicosService para obter os dados do técnico do backend, e se a busca for bem-sucedida, preenche o formulário com os dados do técnico e define o modo de edição como verdadeiro, e em caso de erro, exibe uma mensagem no console
  private carregarTecnico(id: string) {
    this.tecnicosService.buscarPorId(id).subscribe({
      next: (tecnico) => {
        this.modoEdicao = true;
        this.tecnicoId = tecnico.id;
        this.tecnico = {
          nome: tecnico.nome,
          cpf: tecnico.cpf,
          telefone: tecnico.telefone,
          usuario: tecnico.usuario,
          senha: '',
        };
      },
      error: (erro) => {
        console.error('Não foi possível carregar o técnico.', erro);
      },
    });
  }
}
