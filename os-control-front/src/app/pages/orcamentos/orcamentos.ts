import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

type DiaCalendario = {
  data: Date;
  domingo: boolean;
  numero: number;
  selecionado: boolean;
} | null;

type AbaOrcamento = 'pecas' | 'servicos';

type ServicoSelecionado = {
  id: string;
  nome: string;
  valor: number;
};

type PecaSelecionada = {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
};

type OrcamentoSalvo = {
  id: string;
  nome: string;
  nomeOrcamento: string;
  dataAbertura: string;
  observacao: string;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
  valorTotal: string;
  total: number;
  cliente: string;
  nomeCliente: string;
  veiculo: string;
  modelo: string;
};

@Component({
  selector: 'app-orcamentos',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './orcamentos.html',
  styleUrl: './orcamentos.css',
})
export class Orcamentos implements OnInit {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  modoEdicao: boolean = false;
  orcamentoId: string = '';
  nomeOrcamento: string = '';
  observacao: string = '';

  abaAtiva: AbaOrcamento = 'servicos';
  calendarioAberto: boolean = false;
  modalPdfAberto: boolean = false;
  modalServicoAberto: boolean = false;
  modalPecaAberto: boolean = false;

  dataSelecionada: Date = new Date();
  mesExibido: Date = new Date();
  dataAbertura: string = '';
  tituloCalendario: string = '';
  diasCalendario: DiaCalendario[] = [];

  servicosSelecionados: ServicoSelecionado[] = [];
  pecasSelecionadas: PecaSelecionada[] = [];

  novoServico = {
    id: '',
    nome: '',
    valor: '',
  };

  novaPeca = {
    id: '',
    nome: '',
    quantidade: null as number | null,
    valorUnitario: '',
  };

  constructor(private router: Router, private route: ActivatedRoute) {
    this.orcamentoId = this.gerarProximoId();
    this.sincronizarCalendario(this.dataSelecionada);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('orcamentoId');

    if (!id) {
      return;
    }

    this.carregarOrcamento(id);
  }

  get tituloPagina() {
    return this.modoEdicao ? 'Editar orçamento' : 'Novo orçamento';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar orçamento' : 'Confirmar orçamento';
  }

  get placeholderPesquisa() {
    return this.abaAtiva === 'servicos' ? 'Adicionar servico' : 'Adicionar peca/produto';
  }

  get valorTotalNovaPecaFormatado() {
    const total = this.calcularValorTotalNovaPeca();
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get totalServicosFormatado() {
    const total = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get totalPecasFormatado() {
    const total = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get totalOrcamentoFormatado() {
    const totalServicos = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    const totalPecas = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    const total = totalServicos + totalPecas;
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  selecionarAba(aba: AbaOrcamento) {
    this.abaAtiva = aba;
  }

  abrirModalSelecao() {
    if (this.abaAtiva === 'servicos') {
      this.modalServicoAberto = true;
      return;
    }

    this.modalPecaAberto = true;
  }

  fecharModalServico() {
    this.modalServicoAberto = false;
    this.resetNovoServico();
  }

  confirmarServico() {
    const nome = this.novoServico.nome.trim();
    const valor = this.converterEmNumero(this.novoServico.valor);

    if (!nome || valor === null) {
      return;
    }

    this.servicosSelecionados = [
      ...this.servicosSelecionados,
      {
        id: this.novoServico.id.trim() || '--',
        nome,
        valor,
      },
    ];

    this.fecharModalServico();
  }

  fecharModalPeca() {
    this.modalPecaAberto = false;
    this.resetNovaPeca();
  }

  confirmarPeca() {
    const nome = this.novaPeca.nome.trim();
    const quantidade = Number(this.novaPeca.quantidade);
    const valorUnitario = this.converterEmNumero(this.novaPeca.valorUnitario);

    if (!nome || !Number.isFinite(quantidade) || quantidade <= 0 || valorUnitario === null) {
      return;
    }

    this.pecasSelecionadas = [
      ...this.pecasSelecionadas,
      {
        id: this.novaPeca.id.trim() || '--',
        nome,
        quantidade,
        valorUnitario,
        valorTotal: quantidade * valorUnitario,
      },
    ];

    this.fecharModalPeca();
  }

  abrirCalendario() {
    this.sincronizarCalendario(this.dataSelecionada);
    this.calendarioAberto = true;
  }

  fecharCalendario() {
    this.calendarioAberto = false;
  }

  selecionarDia(data: Date) {
    this.dataSelecionada = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    this.sincronizarCalendario(this.dataSelecionada);
    this.fecharCalendario();
  }

  mesAnterior() {
    this.mesExibido = new Date(this.mesExibido.getFullYear(), this.mesExibido.getMonth() - 1, 1);
    this.atualizarCalendario();
  }

  proximoMes() {
    this.mesExibido = new Date(this.mesExibido.getFullYear(), this.mesExibido.getMonth() + 1, 1);
    this.atualizarCalendario();
  }

  abrirModalPdf() {
    this.modalPdfAberto = true;
  }

  executarAcaoPrincipal() {
    if (this.modoEdicao) {
      this.salvarOrcamento();
      return;
    }

    this.abrirModalPdf();
  }

  fecharModalPdf() {
    this.modalPdfAberto = false;
  }

  abrirPdf() {
    this.salvarOrcamento();
    this.fecharModalPdf();
  }

  formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  private salvarOrcamento() {
    const nome = this.nomeOrcamento.trim();

    if (!nome) {
      return;
    }

    const orcamentos = this.carregarOrcamentos();
    const totalServicos = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    const totalPecas = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    const total = totalServicos + totalPecas;

    const orcamentoSalvo: OrcamentoSalvo = {
      id: this.orcamentoId,
      nome,
      nomeOrcamento: nome,
      dataAbertura: this.dataAbertura,
      observacao: this.observacao.trim(),
      servicos: this.servicosSelecionados,
      pecas: this.pecasSelecionadas,
      valorTotal: this.formatarMoeda(total),
      total,
      cliente: '',
      nomeCliente: '',
      veiculo: '',
      modelo: '',
    };

    const orcamentosAtualizados = this.modoEdicao
      ? orcamentos.map((item) => (item.id === orcamentoSalvo.id ? orcamentoSalvo : item))
      : [...orcamentos, orcamentoSalvo];

    localStorage.setItem('orcamentosCadastrados', JSON.stringify(orcamentosAtualizados));

    this.router.navigate(['/orcamentos']);
  }

  private carregarOrcamento(id: string) {
    const orcamento = this.carregarOrcamentos().find((item) => item.id === id);

    if (!orcamento) {
      return;
    }

    this.modoEdicao = true;
    this.orcamentoId = orcamento.id;
    this.nomeOrcamento = orcamento.nome || orcamento.nomeOrcamento || '';
    this.observacao = orcamento.observacao || '';
    this.servicosSelecionados = Array.isArray(orcamento.servicos) ? orcamento.servicos : [];
    this.pecasSelecionadas = Array.isArray(orcamento.pecas) ? orcamento.pecas : [];

    const data = this.converterDataTexto(orcamento.dataAbertura);

    if (data) {
      this.sincronizarCalendario(data);
    }
  }

  private resetNovoServico() {
    this.novoServico = {
      id: '',
      nome: '',
      valor: '',
    };
  }

  private resetNovaPeca() {
    this.novaPeca = {
      id: '',
      nome: '',
      quantidade: null,
      valorUnitario: '',
    };
  }

  private calcularValorTotalNovaPeca() {
    const quantidade = Number(this.novaPeca.quantidade);
    const valorUnitario = this.converterEmNumero(this.novaPeca.valorUnitario);

    if (!Number.isFinite(quantidade) || quantidade <= 0 || valorUnitario === null) {
      return 0;
    }

    return quantidade * valorUnitario;
  }

  private converterEmNumero(valor: string | number) {
    if (typeof valor === 'number') {
      return Number.isFinite(valor) ? valor : null;
    }

    const texto = valor.trim().replace(/[R$\s]/g, '');

    if (!texto) {
      return null;
    }

    const normalizado = texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto;
    const numero = Number(normalizado);

    return Number.isFinite(numero) ? numero : null;
  }

  private sincronizarCalendario(dataBase: Date) {
    this.dataSelecionada = new Date(dataBase.getFullYear(), dataBase.getMonth(), dataBase.getDate());
    this.mesExibido = new Date(this.dataSelecionada.getFullYear(), this.dataSelecionada.getMonth(), 1);
    this.dataAbertura = this.formatarData(this.dataSelecionada);
    this.atualizarCalendario();
  }

  private atualizarCalendario() {
    this.tituloCalendario = this.formatarMesAno(this.mesExibido);

    const ano = this.mesExibido.getFullYear();
    const mes = this.mesExibido.getMonth();
    const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    const dias: DiaCalendario[] = [];

    for (let index = 0; index < primeiroDiaDaSemana; index += 1) {
      dias.push(null);
    }

    for (let numero = 1; numero <= ultimoDiaDoMes; numero += 1) {
      const data = new Date(ano, mes, numero);
      dias.push({
        data,
        domingo: data.getDay() === 0,
        numero,
        selecionado: this.ehMesmaData(data, this.dataSelecionada),
      });
    }

    while (dias.length % 7 !== 0) {
      dias.push(null);
    }

    this.diasCalendario = dias;
  }

  private formatarData(data: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(data);
  }

  private formatarMesAno(data: Date) {
    const texto = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(data);

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  private ehMesmaData(dataA: Date, dataB: Date) {
    return (
      dataA.getDate() === dataB.getDate() &&
      dataA.getMonth() === dataB.getMonth() &&
      dataA.getFullYear() === dataB.getFullYear()
    );
  }

  private converterDataTexto(valor: string) {
    const partes = valor.split('/');

    if (partes.length !== 3) {
      return null;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const ano = Number(partes[2]);
    const data = new Date(ano, mes, dia);

    return Number.isFinite(data.getTime()) ? data : null;
  }

  private carregarOrcamentos(): OrcamentoSalvo[] {
    const chaves = ['orcamentosCadastrados', 'orcamentos', 'cadastroOrcamentos'];

    for (const chave of chaves) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as OrcamentoSalvo[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  private gerarProximoId() {
    const maiorId = this.carregarOrcamentos().reduce((maior, item) => {
      const numero = Number.parseInt(item.id, 10);
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return String(maiorId + 1).padStart(2, '0');
  }
}
