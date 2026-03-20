import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

type PecaSalva = {
  id: string;
  nome: string;
  valor: string;
  valorUnitario: number;
};

@Component({
  selector: 'app-pecas',
  imports: [FormsModule, RouterLink],
  templateUrl: './pecas.html',
  styleUrl: './pecas.css',
})
export class Pecas implements OnInit {
  modoEdicao: boolean = false;
  pecaId: string = '';
  peca = {
    nome: '',
    valor: '',
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.prepararNovoCadastro();
      return;
    }

    this.carregarPeca(id);
  }

  get tituloPagina() {
    return this.modoEdicao ? 'Editar peca' : 'Cadastro de pecas';
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

    const pecas = this.carregarPecas();
    const id = this.pecaId || this.gerarProximoId(pecas);
    const pecaSalva: PecaSalva = {
      id,
      nome,
      valor: this.formatarMoeda(valor),
      valorUnitario: valor,
    };

    const pecasAtualizadas = this.modoEdicao
      ? pecas.map((item) => (item.id === id ? pecaSalva : item))
      : [...pecas, pecaSalva];

    localStorage.setItem('pecasCadastradas', JSON.stringify(pecasAtualizadas));
    this.router.navigate(['/pecas']);
  }

  private carregarPeca(id: string) {
    const peca = this.carregarPecas().find((item) => item.id === id);

    if (!peca) {
      return;
    }

    this.modoEdicao = true;
    this.pecaId = peca.id;
    this.peca = {
      nome: peca.nome,
      valor: typeof peca.valorUnitario === 'number' ? String(peca.valorUnitario) : peca.valor,
    };
  }

  private prepararNovoCadastro() {
    this.pecaId = this.gerarProximoId(this.carregarPecas());
  }

  private carregarPecas(): PecaSalva[] {
    const chaves = ['pecasCadastradas', 'pecas', 'cadastroPecas'];

    for (const chave of chaves) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as PecaSalva[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

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

  private gerarProximoId(pecas: PecaSalva[]) {
    const maiorId = pecas.reduce((maior, item) => {
      const numero = Number.parseInt(item.id, 10);
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return String(maiorId + 1).padStart(2, '0');
  }
}
