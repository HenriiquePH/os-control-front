import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

type ServicoSalvo = {
  id: string;
  nome: string;
  valor: string;
  preco: number;
};

@Component({
  selector: 'app-servicos',
  imports: [FormsModule, RouterLink],
  templateUrl: './servicos.html',
  styleUrl: './servicos.css',
})
export class Servicos implements OnInit {
  modoEdicao: boolean = false;
  servicoId: string = '';
  servico = {
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

    this.carregarServico(id);
  }

  get tituloPagina() {
    return this.modoEdicao ? 'Editar servico' : 'Cadastrar servico';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar' : 'Cadastrar';
  }

  salvarServico() {
    const nome = this.servico.nome.trim();
    const valor = this.converterEmNumero(this.servico.valor);

    if (!nome || valor === null) {
      return;
    }

    const servicos = this.carregarServicos();
    const id = this.servicoId || this.gerarProximoId(servicos);
    const servicoSalvo: ServicoSalvo = {
      id,
      nome,
      valor: this.formatarMoeda(valor),
      preco: valor,
    };

    const servicosAtualizados = this.modoEdicao
      ? servicos.map((item) => (item.id === id ? servicoSalvo : item))
      : [...servicos, servicoSalvo];

    localStorage.setItem('servicosCadastrados', JSON.stringify(servicosAtualizados));
    this.router.navigate(['/servicos']);
  }

  private carregarServico(id: string) {
    const servico = this.carregarServicos().find((item) => item.id === id);

    if (!servico) {
      return;
    }

    this.modoEdicao = true;
    this.servicoId = servico.id;
    this.servico = {
      nome: servico.nome,
      valor: typeof servico.preco === 'number' ? String(servico.preco) : servico.valor,
    };
  }

  private prepararNovoCadastro() {
    this.servicoId = this.gerarProximoId(this.carregarServicos());
  }

  private carregarServicos(): ServicoSalvo[] {
    const chaves = ['servicosCadastrados', 'servicos', 'cadastroServicos'];

    for (const chave of chaves) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as ServicoSalvo[]) : [];
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

  private gerarProximoId(servicos: ServicoSalvo[]) {
    const maiorId = servicos.reduce((maior, item) => {
      const numero = Number.parseInt(item.id, 10);
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return String(maiorId + 1).padStart(2, '0');
  }
}
