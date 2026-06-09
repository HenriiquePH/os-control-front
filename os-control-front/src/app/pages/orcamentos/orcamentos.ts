import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  AbaOrcamento,
  DiaCalendario,
  OrcamentoSalvo,
  PecaSelecionada,
  ServicoSelecionado,
} from '../../models/orcamento.model';
import { PecaSalva } from '../../models/peca.model';
import { ServicoSalvo } from '../../models/servico.model';
import { AuthService } from '../../services/auth.service';
import { OrcamentosService } from '../../services/orcamentos.service';
import { PecasService } from '../../services/pecas.service';
import { ServicosService } from '../../services/servicos.service';
import { converterMoedaParaNumero, formatarMoeda } from '../../utils/formatacao';

@Component({
  selector: 'app-orcamentos',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './orcamentos.html',
  styleUrl: './orcamentos.css',
})
export class Orcamentos implements OnInit {
  readonly formatarMoeda = formatarMoeda;
  usuarioLogado: string = 'Usuario';
  modoEdicao: boolean = false;
  orcamentoId: string = '';
  orcamentoConfirmadoId: string = '';
  nomeOrcamento: string = '';
  observacao: string = '';
  desconto: string = '';

  abaAtiva: AbaOrcamento = 'servicos';
  calendarioAberto: boolean = false;
  modalConfirmacaoPdfAberto: boolean = false;
  modalServicoAberto: boolean = false;
  modalPecaAberto: boolean = false;
  dropdownServicosAberto: boolean = false;
  dropdownPecasAberto: boolean = false;

  dataSelecionada: Date = new Date();
  mesExibido: Date = new Date();
  dataAbertura: string = '';
  tituloCalendario: string = '';
  diasCalendario: DiaCalendario[] = [];

  servicosSelecionados: ServicoSelecionado[] = [];
  pecasSelecionadas: PecaSelecionada[] = [];
  servicosDisponiveis: ServicoSalvo[] = [];
  pecasDisponiveis: PecaSalva[] = [];

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
    private pecasService: PecasService,
    private servicosService: ServicosService,
    private authService: AuthService
  ) {
    this.usuarioLogado = this.authService.obterUsuario();
    this.sincronizarCalendario(this.dataSelecionada);
  }

  ngOnInit() {
    this.carregarCatalogos();

    const id = this.route.snapshot.paramMap.get('orcamentoId');

    if (!id) {
      return;
    }

    this.carregarOrcamento(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar orçamento' : 'Novo orçamento';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar orçamento' : 'Confirmar orçamento';
  }

  get mensagemConfirmacaoPdf() {
    return this.modoEdicao ? 'Orcamento salvo,' : 'Orcamento confirmado,';
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

  get totalOrcamento() {
    const totalServicos = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    const totalPecas = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    const desconto = converterMoedaParaNumero(this.desconto) || 0;
    const total = Math.max(0, totalServicos + totalPecas - desconto);
    return total > 0 ? this.formatarMoeda(total) : '';
  }

  get servicosDisponiveisFiltrados() {
    const termo = this.novoServico.nome.trim().toLowerCase();

    return this.servicosDisponiveis.filter((servico) => {
      return !termo || servico.nome.toLowerCase().includes(termo) || servico.id.toLowerCase().includes(termo);
    });
  }

  get pecasDisponiveisFiltradas() {
    const termo = this.novaPeca.nome.trim().toLowerCase();

    return this.pecasDisponiveis.filter((peca) => {
      return !termo || peca.nome.toLowerCase().includes(termo) || peca.id.toLowerCase().includes(termo);
    });
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
    this.dropdownServicosAberto = false;
    this.limparNovoServico();
  }

  abrirDropdownServicos() {
    if (this.novoServico.id) {
      return;
    }

    this.dropdownServicosAberto = true;
  }

  fecharDropdownServicos() {
    this.dropdownServicosAberto = false;
  }

  selecionarServico(servico: ServicoSalvo) {
    this.novoServico = {
      id: servico.id,
      nome: servico.nome,
      valor: String(servico.preco),
    };
    this.dropdownServicosAberto = false;
  }

  limparSelecaoServico() {
    this.novoServico = {
      id: '',
      nome: '',
      valor: '',
    };
    this.dropdownServicosAberto = true;
  }

  confirmarServico() {
    const id = Number.parseInt(this.novoServico.id.trim(), 10);
    const nome = this.novoServico.nome.trim();
    const valor = converterMoedaParaNumero(this.novoServico.valor);

    if (!Number.isFinite(id) || !nome || valor === null) {
      return;
    }

    this.servicosSelecionados = [
      ...this.servicosSelecionados,
      {
        id: String(id).padStart(2, '0'),
        nome,
        valor,
      },
    ];

    this.limparNovoServico();
    this.dropdownServicosAberto = false;
  }

  fecharModalPeca() {
    this.modalPecaAberto = false;
    this.dropdownPecasAberto = false;
    this.limparNovaPeca();
  }

  abrirDropdownPecas() {
    if (this.novaPeca.id) {
      return;
    }

    this.dropdownPecasAberto = true;
  }

  fecharDropdownPecas() {
    this.dropdownPecasAberto = false;
  }

  selecionarPeca(peca: PecaSalva) {
    this.novaPeca = {
      ...this.novaPeca,
      id: peca.id,
      nome: peca.nome,
      valorUnitario: String(peca.valorUnitario),
    };
    this.dropdownPecasAberto = false;
  }

  limparSelecaoPeca() {
    this.novaPeca = {
      ...this.novaPeca,
      id: '',
      nome: '',
      valorUnitario: '',
    };
    this.dropdownPecasAberto = true;
  }

  confirmarPeca() {
    const id = Number.parseInt(this.novaPeca.id.trim(), 10);
    const nome = this.novaPeca.nome.trim();
    const quantidade = Number(this.novaPeca.quantidade);
    const valorUnitario = converterMoedaParaNumero(this.novaPeca.valorUnitario);

    if (!Number.isFinite(id) || !nome || !Number.isFinite(quantidade) || quantidade <= 0 || valorUnitario === null) {
      return;
    }

    this.pecasSelecionadas = [
      ...this.pecasSelecionadas,
      {
        id: String(id).padStart(2, '0'),
        nome,
        quantidade,
        valorUnitario,
        valorTotal: quantidade * valorUnitario,
      },
    ];

    this.limparNovaPeca();
    this.dropdownPecasAberto = false;
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

  confirmar() {
    this.salvarOrcamento();
  }

  emitirPdf() {
    if (!this.orcamentoId) {
      return;
    }

    this.abrirPdfOrcamento(this.orcamentoId);
  }

  confirmarExibicaoPdf() {
    const id = this.orcamentoConfirmadoId || this.orcamentoId;

    if (!id) {
      this.finalizarConfirmacaoOrcamento();
      return;
    }

    this.abrirPdfOrcamento(id, () => this.finalizarConfirmacaoOrcamento());
  }

  cancelarExibicaoPdf() {
    this.finalizarConfirmacaoOrcamento();
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }

  private salvarOrcamento() {
    const nome = this.nomeOrcamento.trim();

    const totalServicos = this.servicosSelecionados.reduce((soma, item) => soma + item.valor, 0);
    const totalPecas = this.pecasSelecionadas.reduce((soma, item) => soma + item.valorTotal, 0);
    const desconto = converterMoedaParaNumero(this.desconto) || 0;
    const total = Math.max(0, totalServicos + totalPecas - desconto);

    const orcamentoSalvo: OrcamentoSalvo = {
      id: this.orcamentoId,
      nome,
      nomeOrcamento: nome,
      dataAbertura: this.dataAbertura,
      observacao: this.observacao.trim(),
      desconto: this.desconto.trim(),
      servicos: this.servicosSelecionados,
      pecas: this.pecasSelecionadas,
      valorTotal: this.formatarMoeda(total),
      total,
      cliente: '',
      nomeCliente: '',
      veiculo: '',
      modelo: '',
    };

    this.orcamentosService.salvar(orcamentoSalvo).subscribe({
      next: (orcamento) => {
        this.orcamentoId = orcamento.id;
        this.orcamentoConfirmadoId = orcamento.id;
        this.modalConfirmacaoPdfAberto = true;
      },
      error: (erro) => {
        console.error('Não foi possível salvar o orçamento.', erro);
      },
    });
  }

  private carregarCatalogos() {
    this.servicosService.listar().subscribe({
      next: (servicos) => {
        this.servicosDisponiveis = servicos;
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar os servicos.', erro);
        this.servicosDisponiveis = [];
      },
    });

    this.pecasService.listar().subscribe({
      next: (pecas) => {
        this.pecasDisponiveis = pecas;
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar as pecas.', erro);
        this.pecasDisponiveis = [];
      },
    });
  }

  private carregarOrcamento(id: string) {
    this.orcamentosService.buscarPorId(id).subscribe({
      next: (orcamento) => {
        this.modoEdicao = true;
        this.orcamentoId = orcamento.id;
        this.nomeOrcamento = orcamento.nome || orcamento.nomeOrcamento || '';
        this.observacao = orcamento.observacao || '';
        this.desconto = orcamento.desconto || '';
        this.servicosSelecionados = Array.isArray(orcamento.servicos) ? orcamento.servicos : [];
        this.pecasSelecionadas = Array.isArray(orcamento.pecas) ? orcamento.pecas : [];

        const data = this.converterDataTexto(orcamento.dataAbertura);

        if (data) {
          this.sincronizarCalendario(data);
        }
      },
      error: (erro) => {
        console.error('Não foi possível carregar o orçamento.', erro);
      },
    });
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
    const valorUnitario = converterMoedaParaNumero(this.novaPeca.valorUnitario);

    if (!Number.isFinite(quantidade) || quantidade <= 0 || valorUnitario === null) {
      return 0;
    }

    return quantidade * valorUnitario;
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

  private finalizarConfirmacaoOrcamento() {
    this.modalConfirmacaoPdfAberto = false;
    this.orcamentoConfirmadoId = '';
    this.router.navigate(['/orcamentos']);
  }

  private abrirPdfOrcamento(id: string, aoConcluir?: () => void) {
    const janela = window.open('', '_blank');

    if (!janela) {
      aoConcluir?.();
      return;
    }

    this.orcamentosService.obterPdf(id).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(pdf);
        janela.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        aoConcluir?.();
      },
      error: (erro) => {
        console.error('Nao foi possivel abrir o PDF do orcamento.', erro);
        janela.close();
        aoConcluir?.();
      },
    });
  }
}

