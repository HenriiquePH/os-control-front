import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AbaOs, DiaCalendario, OrdemServicoSalva } from '../../models/ordem-servico.model';
import { PecaSelecionada, ServicoSelecionado } from '../../models/orcamento.model';
import { OrdensServicoService } from '../../services/ordens-servico.service';
import { OrcamentosService } from '../../services/orcamentos.service';
import { TecnicosService } from '../../services/tecnicos.service';

@Component({
  selector: 'app-ordens-servico',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ordens-servico.html',
  styleUrl: './ordens-servico.css',
})
export class OrdensServico implements OnInit {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  modoEdicao: boolean = false;
  numeroOs: string = '';
  numeroOrcamento: string = '';
  nomeCliente: string = '';
  veiculo: string = '';
  observacao: string = '';
  abaAtiva: AbaOs = 'pecas';

  opcoesStatus: string[] = ['Aberto', 'Em andamento', 'Fechada'];
  statusSelecionado: string = 'Aberto';

  tecnicosDisponiveis: string[] = [];
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orcamentosService: OrcamentosService,
    private ordensServicoService: OrdensServicoService,
    private tecnicosService: TecnicosService
  ) {
    this.sincronizarCalendario(this.dataSelecionada);
  }

  ngOnInit() {
    this.tecnicosDisponiveis = this.tecnicosService.listarNomes();

    this.route.paramMap.subscribe((params) => {
      this.limparFormulario();

      const ordemId = params.get('ordemId');
      const orcamentoId = params.get('orcamentoId');

      if (ordemId) {
        this.carregarOrdem(ordemId);
        return;
      }

      if (orcamentoId) {
        this.carregarOrcamento(orcamentoId);
      }
    });
  }

  get titulo() {
    return this.modoEdicao ? 'Editar OS' : 'Ordens de Servicos';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar OS' : 'Cadastrar OS';
  }

  get placeholder() {
    return this.abaAtiva === 'servicos' ? 'Adicionar servico' : 'Adicionar peca/produto';
  }

  get totalNovaPeca() {
    const total = this.calcularTotalNovaPeca();
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get totalServicos() {
    const total = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get totalPecas() {
    const total = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get totalOs() {
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
    this.limparNovoServico();
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
    this.limparNovaPeca();
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
    const ordem: OrdemServicoSalva = {
      id: this.numeroOs || this.ordensServicoService.gerarProximoId(),
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
      totalOs: this.totalOs,
    };

    this.ordensServicoService.salvar(ordem);
    this.router.navigate(['/ordens-servico/visualizar']);
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  private carregarOrcamento(id: string) {
    const orcamento = this.orcamentosService.buscarParaImportacao(id);

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

  private carregarOrdem(id: string) {
    const ordem = this.ordensServicoService.buscarPorId(id);

    if (!ordem) {
      return;
    }

    this.modoEdicao = true;
    this.numeroOs = ordem.id;
    this.numeroOrcamento = ordem.numeroOrcamento;
    this.nomeCliente = ordem.cliente;
    this.veiculo = ordem.veiculo;
    this.observacao = ordem.observacao;
    this.statusSelecionado = ordem.status || 'Aberto';
    this.tecnicoSelecionado = ordem.tecnico === '--' ? '' : ordem.tecnico;
    this.desconto = ordem.desconto;
    this.servicosSelecionados = ordem.servicos;
    this.pecasSelecionadas = ordem.pecas;

    const data = this.converterDataTexto(ordem.dataAbertura);

    if (data) {
      this.sincronizarCalendario(data);
    }
  }

  private limparFormulario() {
    this.modoEdicao = false;
    this.numeroOs = this.ordensServicoService.gerarProximoId();
    this.numeroOrcamento = '';
    this.nomeCliente = '';
    this.veiculo = '';
    this.observacao = '';
    this.abaAtiva = 'pecas';
    this.statusSelecionado = 'Aberto';
    this.tecnicoSelecionado = '';
    this.desconto = '';
    this.servicosSelecionados = [];
    this.pecasSelecionadas = [];
    this.sincronizarCalendario(new Date());
  }

  private limparNovoServico() {
    this.novoServico = {
      id: '',
      nome: '',
      valor: '',
    };
  }

  private limparNovaPeca() {
    this.novaPeca = {
      id: '',
      nome: '',
      quantidade: null,
      valorUnitario: '',
    };
  }

  private calcularTotalNovaPeca() {
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
