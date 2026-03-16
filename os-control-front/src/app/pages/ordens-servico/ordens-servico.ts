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

type AbaOs = 'pecas' | 'servicos';

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

type OrcamentoImportado = {
  id: string;
  cliente: string;
  veiculo: string;
  dataAbertura: string;
  observacao: string;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
};

@Component({
  selector: 'app-ordens-servico',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ordens-servico.html',
  styleUrl: './ordens-servico.css',
})
export class OrdensServico implements OnInit {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  numeroOs: string = '';
  numeroOrcamento: string = '';
  nomeCliente: string = '';
  veiculo: string = '';
  observacao: string = '';
  abaAtiva: AbaOs = 'pecas';

  opcoesStatus: string[] = ['Aberto', 'Em andamento', 'Fechada'];
  statusSelecionado: string = 'Aberto';

  tecnicosDisponiveis: string[] = this.carregarTecnicos();
  tecnicoSelecionado: string = '';

  desconto: string = '';

  calendarioAberto: boolean = false;
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
    this.sincronizarCalendario(this.dataSelecionada);
  }

  ngOnInit() {
    this.numeroOs = this.gerarNumeroOs();

    this.route.paramMap.subscribe((params) => {
      this.numeroOrcamento = '';
      this.desconto = '';
      this.tecnicoSelecionado = '';
      this.statusSelecionado = 'Aberto';
      this.abaAtiva = 'pecas';
      this.servicosSelecionados = [];
      this.pecasSelecionadas = [];
      this.nomeCliente = '';
      this.veiculo = '';
      this.observacao = '';

      const id = params.get('id');

      if (id) {
        this.carregarOrcamentoImportado(id);
      }
    });
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

  get totalOsFormatado() {
    const totalServicos = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    const totalPecas = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    const desconto = this.converterEmNumero(this.desconto) || 0;
    const total = Math.max(0, totalServicos + totalPecas - desconto);
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  selecionarAba(aba: AbaOs) {
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

  formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  salvarOs() {
    const ordensSalvas = this.carregarOrdensSalvas();
    const ordem = {
      id: this.numeroOs || this.gerarNumeroOs(),
      numeroOrcamento: this.numeroOrcamento,
      cliente: this.nomeCliente.trim() || 'Cliente',
      veiculo: this.veiculo.trim() || 'Veiculo',
      status: this.statusSelecionado,
      tecnico: this.tecnicoSelecionado || '--',
      dataAbertura: this.dataAbertura,
      observacao: this.observacao.trim(),
      servicos: this.servicosSelecionados,
      pecas: this.pecasSelecionadas,
      desconto: this.desconto,
      totalOs: this.totalOsFormatado,
    };

    localStorage.setItem(
      'ordensServicoCadastradas',
      JSON.stringify([...ordensSalvas.filter((item) => item.id !== ordem.id), ordem])
    );

    this.router.navigate(['/ordens-servico/visualizar']);
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  private carregarTecnicos() {
    const chaves = ['tecnicosCadastrados', 'tecnicos', 'cadastroTecnicos'];

    for (const chave of chaves) {
      const bruto = localStorage.getItem(chave);

      if (!bruto) {
        continue;
      }

      try {
        const dados = JSON.parse(bruto);

        if (!Array.isArray(dados)) {
          continue;
        }

        const nomes = dados
          .map((item) => {
            if (typeof item === 'string') {
              return item.trim();
            }

            if (item && typeof item === 'object') {
              const candidato = item.nome || item.usuario || item.name;
              return typeof candidato === 'string' ? candidato.trim() : '';
            }

            return '';
          })
          .filter((nome) => nome.length > 0);

        if (nomes.length > 0) {
          return nomes;
        }
      } catch {
        continue;
      }
    }

    return [];
  }

  private carregarOrcamentoImportado(id: string) {
    const orcamento = this.buscarOrcamento(id);

    if (!orcamento) {
      return;
    }

    this.numeroOrcamento = orcamento.id;
    this.nomeCliente = orcamento.cliente;
    this.veiculo = orcamento.veiculo;
    this.observacao = orcamento.observacao;
    this.servicosSelecionados = orcamento.servicos;
    this.pecasSelecionadas = orcamento.pecas;

    const data = this.converterDataTexto(orcamento.dataAbertura);

    if (data) {
      this.sincronizarCalendario(data);
    }
  }

  private buscarOrcamento(id: string): OrcamentoImportado | null {
    const chaves = ['orcamentosCadastrados', 'orcamentos', 'cadastroOrcamentos'];

    for (const chave of chaves) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);

        if (!Array.isArray(dados)) {
          continue;
        }

        const encontrado = dados
          .map((item, indice) => this.mapearOrcamento(item, indice))
          .find((item) => item?.id === id);

        if (encontrado) {
          return encontrado;
        }
      } catch {
        continue;
      }
    }

    return id === '01'
      ? {
          id: '01',
          cliente: 'Joao de Souza',
          veiculo: 'Corolla',
          dataAbertura: '14/03/2026',
          observacao: '',
          servicos: [{ id: '01', nome: 'Revisao geral', valor: 185 }],
          pecas: [{ id: '01', nome: 'Filtro de oleo', quantidade: 1, valorUnitario: 150, valorTotal: 150 }],
        }
      : null;
  }

  private mapearOrcamento(item: unknown, indice: number): OrcamentoImportado | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const registro = item as Record<string, unknown>;
    const id = this.comoTexto(registro['id'] ?? registro['codigo']) || String(indice + 1).padStart(2, '0');

    return {
      id,
      cliente: this.comoTexto(registro['cliente'] ?? registro['nomeCliente']) || 'Cliente',
      veiculo: this.comoTexto(registro['veiculo'] ?? registro['modelo']) || 'Veiculo',
      dataAbertura: this.comoTexto(registro['dataAbertura']) || '14/03/2026',
      observacao: this.comoTexto(registro['observacao']),
      servicos: [],
      pecas: [],
    };
  }

  private carregarOrdensSalvas() {
    const valor = localStorage.getItem('ordensServicoCadastradas');

    if (!valor) {
      return [];
    }

    try {
      const dados = JSON.parse(valor);
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  }

  private gerarNumeroOs() {
    return String(this.carregarOrdensSalvas().length + 1).padStart(2, '0');
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

  private comoTexto(valor: unknown) {
    return typeof valor === 'string' ? valor.trim() : '';
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
}
