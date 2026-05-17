import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicoFormulario, ServicoSalvo } from '../../models/servico.model';
import { ServicosService } from '../../services/servicos.service';

@Component({
  selector: 'app-servicos',
  imports: [FormsModule, RouterLink],
  templateUrl: './servicos.html',
  styleUrl: './servicos.css',
})
// o componente Servicos é responsável por exibir o formulário de cadastro e edição de serviços, permitindo que o usuário preencha os campos necessários para criar ou atualizar um serviço, e gerencia o estado do formulário, incluindo a lógica para determinar se está em modo de edição ou cadastro, e as ações para salvar os dados do serviço no backend utilizando o ServicosService, além de lidar com a navegação após a operação de salvar.
export class Servicos implements OnInit {
  modoEdicao: boolean = false;
  servicoId: string = '';
  servico: ServicoFormulario = {
    nome: '',
    valor: '',
  };
  
  // o construtor recebe as dependências necessárias para o componente, como o Router para navegação, o ActivatedRoute para acessar os parâmetros da rota e o ServicosService para acessar os dados dos serviços e realizar operações de CRUD
  constructor(private router: Router, private route: ActivatedRoute, private servicosService: ServicosService) {}

  // o método ngOnInit é chamado automaticamente quando o componente é inicializado, e é responsável por verificar se há um ID de serviço nos parâmetros da rota para determinar se está em modo de edição ou cadastro, e carregar os dados do serviço correspondente caso esteja em modo de edição, ou preparar um novo cadastro caso contrário
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.prepararNovoCadastro();
      return;
    }

    this.carregarServico(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar servico' : 'Cadastrar serviço';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar' : 'Cadastrar';
  }
  // método para salvar um serviço, que pega os dados do formulário, prepara para salvar, e chama o método de salvar do servicosService, e após salvar, retorna para a lista de serviços, ou em caso de erro, exibe uma mensagem no console
  salvarServico() {
    const nome = this.servico.nome.trim();
    const valor = this.converterEmNumero(this.servico.valor);

    if (!nome || valor === null) {
      return;
    }
    // prepara os dados do serviço para salvar, verificando se é um novo cadastro ou uma atualização, e fazendo a requisição POST ou PUT para o backend com os headers de autenticação
    const servicoSalvo: ServicoSalvo = {
      id: this.servicoId,
      nome,
      valor: this.formatarMoeda(valor),
      preco: valor,
    };
    // chama o metodo de salvar do servicosService, e após salvar, retorna para a lista de serviços, ou em caso de erro, exibe uma mensagem no console
    this.servicosService.salvar(servicoSalvo).subscribe({
      next: () => this.router.navigate(['/servicos']),
      error: (erro) => console.error('Erro ao salvar servico no backend.', erro),
    });
  }
  // método para carregar um serviço específico por ID, fazendo uma requisição GET para o backend e mapeando os dados do serviço para o formato de salvo, formatando o valor como moeda e mantendo o valor numérico para edição
  private carregarServico(id: string) { 
    this.servicosService.buscarPorId(id).subscribe({
      next: (servico) => {
        this.modoEdicao = true;
        this.servicoId = servico.id;
        this.servico = {
          nome: servico.nome,
          valor: typeof servico.preco === 'number' ? String(servico.preco) : servico.valor,
        };
      },
      error: (erro) => console.error('Erro ao carregar servico do backend.', erro),
    });
  }

  // método para preparar um novo cadastro, garantindo que o ID esteja vazio para novo cadastro
  private prepararNovoCadastro() {
    this.servicoId = '';
  }

  // método para converter o valor string para numero, removendo simbolos de moeda e tratando virgula como decimal
  private converterEmNumero(valor: string) {
    const texto = valor.trim().replace(/[R$\s]/g, '');

    if (!texto) {
      return null;
    }

    const normalizado = texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto;
    const numero = Number(normalizado);

    return Number.isFinite(numero) ? numero : null;
  }

  private formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }
}
