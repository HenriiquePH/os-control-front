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
export class Pecas implements OnInit {
  modoEdicao: boolean = false;
  pecaId: string = '';
  peca: PecaFormulario = {
    nome: '',
    valor: '',
  };

  constructor(private router: Router, private route: ActivatedRoute, private pecasService: PecasService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.prepararNovoCadastro();
      return;
    }

    this.carregarPeca(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar peca' : 'Cadastro de peças';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar' : 'Cadastrar';
  }

  salvarPeca() {
    const nome = this.peca.nome.trim();
    const valor = this.converterEmNumero(this.peca.valor);

    if (!nome || valor === null) {
      return;
    }

    const pecaSalva: PecaSalva = {
      id: this.pecaId,
      nome,
      valor: this.formatarMoeda(valor),
      valorUnitario: valor,
    };

    this.pecasService.salvar(pecaSalva).subscribe({
      next: () => this.router.navigate(['/pecas']),
      error: (erro) => console.error('Erro ao salvar peca no backend.', erro),
    });
  }

  private carregarPeca(id: string) {
    this.pecasService.buscarPorId(id).subscribe({
      next: (peca) => {
        this.modoEdicao = true;
        this.pecaId = peca.id;
        this.peca = {
          nome: peca.nome,
          valor: typeof peca.valorUnitario === 'number' ? String(peca.valorUnitario) : peca.valor,
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

    const normalizado = texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto;
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
