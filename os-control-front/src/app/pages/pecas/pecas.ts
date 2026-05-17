import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PecaFormulario, PecaSalva } from '../../models/peca.model';
import { PecasService } from '../../services/pecas.service';

@Component({
  selector: 'app-pecas',
  imports: [FormsModule, RouterLink],
  templateUrl: './pecas.html',
  styleUrl: './pecas.css',
})
export class Pecas implements OnInit { // responsavel por mostrar cadastro e edição de peças
  modoEdicao: boolean = false;
  pecaId: string = ''; 
  peca: PecaFormulario = {
    nome: '',
    valor: '',
  };
  // o construtor recebe as dependências necessárias para o componente, como o Router para navegação, o ActivatedRoute para acessar os parâmetros da rota e o PecasService para acessar os dados das peças e realizar operações de CRUD
  constructor(private router: Router, private route: ActivatedRoute, private pecasService: PecasService) {}

  ngOnInit() { // o método ngOnInit é chamado automaticamente quando o componente é inicializado, e é responsável por verificar se há um ID de peça nos parâmetros da rota para determinar se está em modo de edição ou cadastro, e carregar os dados da peça correspondente caso esteja em modo de edição, ou preparar um novo cadastro caso contrário
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.prepararNovoCadastro();
      return;
    }

    this.carregarPeca(id);
  }

  get titulo() { // retorna o titulo da página, dependendo se está em modo de edição ou cadastro
    return this.modoEdicao ? 'Editar peca' : 'Cadastro de peças';
  }

  get textoBotao() { // retorna o texto do botão, dependendo se está em modo de edição ou cadastro
    return this.modoEdicao ? 'Salvar' : 'Cadastrar';
  }

  salvarPeca() { // pega dados e prepara para salvar, se for valido ele salva.
    const nome = this.peca.nome.trim(); // trim remove espaços em branco se tiver
    const valor = this.converterEmNumero(this.peca.valor);

    if (!nome || valor === null) {
      return;
    }

    const pecaSalva: PecaSalva = { // prepara para salvar
      id: this.pecaId,  // usa o id da peça carregada para editar, ou vazio para novo cadastro
      nome,
      valor: this.formatarMoeda(valor),
      valorUnitario: valor,
    };

    this.pecasService.salvar(pecaSalva).subscribe({ // chama o metodo de salvar do pecasService 
      next: () => this.router.navigate(['/pecas']), //quando salva, retorna para a lista de peças
      error: (erro) => console.error('Erro ao salvar peca no backend.', erro),
    });
  }

  private carregarPeca(id: string) { // carrega a peça do backend para edição, e preenche o formulário com os dados retornados
    this.pecasService.buscarPorId(id).subscribe({ // chama o método buscarPorId do PecasService, passando o id da peça, e se inscreve para receber o resultado
      next: (peca) => { // se a peça for carregada com sucesso, preenche o formulário e ativa o modo de edição
        this.modoEdicao = true; // ativa o modo de edição
        this.pecaId = peca.id; // guarda o id da peça para usar na hora de salvar, caso seja edição
        this.peca = {  // preenche o formulário com os dados da peça, convertendo o valorUnitario para string formatada, e garantindo que o nome seja preenchido
          nome: peca.nome, // garante que o nome seja preenchido
          valor: typeof peca.valorUnitario === 'number' ? String(peca.valorUnitario) : peca.valor, // converte o valorUnitario para string, caso seja numero, ou usa o valor original caso já seja string
        };
      },
      error: (erro) => console.error('Erro ao carregar peca do backend.', erro),
    });
  }

  private prepararNovoCadastro() {
    this.pecaId = ''; // Garante que o ID esteja vazio para novo cadastro
  }

  private converterEmNumero(valor: string) { // converte o valor string para numero, removendo simbolos de moeda e tratando virgula como decimal
    const texto = valor.trim().replace(/[R$\s]/g, ''); // remove simbolos de moeda e espaços, e trim para garantir que nao tenha espacos sobrando

    if (!texto) { // se o texto for vazio apos remover simbolos, retorna null para indicar valor invalido
      return null;
    }

    const normalizado = texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto; // se 
    const numero = Number(normalizado);

    return Number.isFinite(numero) ? numero : null;
  }

  private formatarMoeda(valor: number) { // formata o numero para o formato de moeda brasileira, usando Intl.NumberFormat
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor); 
  }
}
