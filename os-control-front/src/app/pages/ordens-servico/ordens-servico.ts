import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AbaOs, DiaCalendario, OrdemServicoSalva } from '../../models/ordem-servico.model';
import { ClienteSalvo, Veiculo } from '../../models/cliente.model';
import { PecaSalva } from '../../models/peca.model';
import { ServicoSalvo } from '../../models/servico.model';
import { PecaSelecionada, ServicoSelecionado } from '../../models/orcamento.model';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';
import { OrdensServicoService } from '../../services/ordens-servico.service';
import { PecasService } from '../../services/pecas.service';
import { ServicosService } from '../../services/servicos.service';
import { TecnicosService } from '../../services/tecnicos.service';

@Component({
  selector: 'app-ordens-servico',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ordens-servico.html',
  styleUrl: './ordens-servico.css',
})
export class OrdensServico implements OnInit {
  usuarioLogado: string = 'Usuario';
  modoEdicao: boolean = false;
  numeroOs: string = '';
  numeroOrcamento: string = '';
  clienteId: string = '';
  nomeCliente: string = '';
  clientesDisponiveis: ClienteSalvo[] = [];
  veiculoId: string = '';
  veiculo: string = '';
  veiculosDisponiveis: Veiculo[] = [];
  observacao: string = '';
  abaAtiva: AbaOs = 'pecas';

  opcoesStatus: string[] = ['Aberto', 'Em andamento', 'Fechada'];
  statusSelecionado: string = 'Aberto';

  tecnicosDisponiveis: { id: string; nome: string }[] = [];
  tecnicoId: string = '';
  tecnicoNome: string = '';

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
    private clientesService: ClientesService,
    private ordensServicoService: OrdensServicoService,
    private pecasService: PecasService,
    private servicosService: ServicosService,
    private tecnicosService: TecnicosService,
    private authService: AuthService
  ) {
    this.usuarioLogado = this.authService.obterUsuario();
    this.sincronizarCalendario(this.dataSelecionada);
  }

  ngOnInit() {
    this.carregarCatalogos();

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

  selecionarAba(aba: AbaOs) {
    this.abaAtiva = aba;
  }

  selecionarCliente(clienteId: string) {
    this.clienteId = clienteId;
    this.sincronizarClienteSelecionado(false);
  }

  selecionarVeiculo(veiculoId: string) {
    this.veiculoId = veiculoId;
    this.sincronizarVeiculoSelecionado();
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

  selecionarServico(servico: ServicoSalvo) {
    this.novoServico = {
      id: servico.id,
      nome: servico.nome,
      valor: String(servico.preco),
    };
  }

  confirmarServico() {
    const id = Number.parseInt(this.novoServico.id.trim(), 10);
    const nome = this.novoServico.nome.trim();
    const valor = this.converterEmNumero(this.novoServico.valor);

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

    this.fecharModalServico();
  }

  fecharModalPeca() {
    this.modalPecaAberto = false;
    this.limparNovaPeca();
  }

  selecionarPeca(peca: PecaSalva) {
    this.novaPeca = {
      ...this.novaPeca,
      id: peca.id,
      nome: peca.nome,
      valorUnitario: String(peca.valorUnitario),
    };
  }

  confirmarPeca() {
    const id = Number.parseInt(this.novaPeca.id.trim(), 10);
    const nome = this.novaPeca.nome.trim();
    const quantidade = Number(this.novaPeca.quantidade);
    const valorUnitario = this.converterEmNumero(this.novaPeca.valorUnitario);

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
      id: this.numeroOs,
      numeroOrcamento: this.numeroOrcamento,
      clienteId: this.clienteId,
      clienteNome: this.nomeCliente.trim(),
      veiculoId: this.veiculoId,
      veiculoNome: this.veiculo.trim(),
      status: this.statusSelecionado,
      tecnicoId: this.tecnicoId,
      tecnicoNome: this.obterNomeTecnicoSelecionado(),
      dataAbertura: this.dataAbertura,
      observacao: this.observacao.trim(),
      servicos: this.servicosSelecionados,
      pecas: this.pecasSelecionadas,
      desconto: this.desconto,
      totalOs: this.totalOs,
    };

    this.ordensServicoService.salvar(ordem).subscribe({
      next: () => {
        this.router.navigate(['/ordens-servico/visualizar']);
      },
      error: (erro) => {
        console.error('Nao foi possivel salvar a OS.', erro);
      },
    });
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }

  private carregarCatalogos() {
    this.clientesService.listar().subscribe({
      next: (clientes) => {
        this.clientesDisponiveis = clientes;
        this.sincronizarClienteSelecionado(true);
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar os clientes.', erro);
        this.clientesDisponiveis = [];
        this.veiculosDisponiveis = [];
      },
    });

    this.tecnicosService.listar().subscribe({
      next: (tecnicos) => {
        this.tecnicosDisponiveis = tecnicos.map((tecnico) => ({
          id: tecnico.id,
          nome: tecnico.nome,
        }));
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar os tecnicos.', erro);
        this.tecnicosDisponiveis = [];
      },
    });

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
    this.ordensServicoService.buscarParaImportacao(id).subscribe({
      next: (ordem) => {
        this.numeroOrcamento = ordem.numeroOrcamento || id.padStart(2, '0');
        this.statusSelecionado = ordem.status || 'Aberto';
        this.observacao = ordem.observacao;
        this.desconto = ordem.desconto;
        this.servicosSelecionados = ordem.servicos;
        this.pecasSelecionadas = ordem.pecas;

        const data = this.converterDataTexto(ordem.dataAbertura);

        if (data) {
          this.sincronizarCalendario(data);
        }
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar o orcamento para importacao.', erro);
      },
    });
  }

  private carregarOrdem(id: string) {
    this.ordensServicoService.buscarPorId(id).subscribe({
      next: (ordem) => {
        this.modoEdicao = true;
        this.numeroOs = ordem.id;
        this.numeroOrcamento = ordem.numeroOrcamento;
        this.clienteId = ordem.clienteId;
        this.nomeCliente = ordem.clienteNome;
        this.veiculoId = ordem.veiculoId;
        this.veiculo = ordem.veiculoNome;
        this.observacao = ordem.observacao;
        this.statusSelecionado = ordem.status || 'Aberto';
        this.tecnicoId = ordem.tecnicoId;
        this.tecnicoNome = ordem.tecnicoNome;
        this.desconto = ordem.desconto;
        this.servicosSelecionados = ordem.servicos;
        this.pecasSelecionadas = ordem.pecas;
        this.sincronizarClienteSelecionado(true);

        const data = this.converterDataTexto(ordem.dataAbertura);

        if (data) {
          this.sincronizarCalendario(data);
        }
      },
      error: (erro) => {
        console.error('Nao foi possivel carregar a ordem de servico.', erro);
      },
    });
  }

  private limparFormulario() {
    this.modoEdicao = false;
    this.numeroOs = '';
    this.numeroOrcamento = '';
    this.clienteId = '';
    this.nomeCliente = '';
    this.veiculoId = '';
    this.veiculo = '';
    this.veiculosDisponiveis = [];
    this.observacao = '';
    this.abaAtiva = 'pecas';
    this.statusSelecionado = 'Aberto';
    this.tecnicoId = '';
    this.tecnicoNome = '';
    this.desconto = '';
    this.servicosSelecionados = [];
    this.pecasSelecionadas = [];
    this.limparNovoServico();
    this.limparNovaPeca();
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

  private obterNomeTecnicoSelecionado() {
    return this.tecnicosDisponiveis.find((tecnico) => tecnico.id === this.tecnicoId)?.nome || this.tecnicoNome || '';
  }

  private sincronizarClienteSelecionado(preservarVeiculo: boolean) {
    const cliente = this.clientesDisponiveis.find((item) => item.id === this.clienteId);

    if (!cliente) {
      this.veiculosDisponiveis = [];

      if (!preservarVeiculo) {
        this.veiculoId = '';
        this.veiculo = '';
      }

      return;
    }

    this.nomeCliente = cliente.nome;
    this.veiculosDisponiveis = cliente.veiculos;

    if (!preservarVeiculo) {
      this.veiculoId = '';
      this.veiculo = '';
      return;
    }

    this.sincronizarVeiculoSelecionado();
  }

  private sincronizarVeiculoSelecionado() {
    const veiculoSelecionado = this.veiculosDisponiveis.find((item) => item.id === this.veiculoId);
    this.veiculo = veiculoSelecionado ? this.formatarVeiculo(veiculoSelecionado) : '';
  }

  private formatarVeiculo(veiculo: Veiculo) {
    return [veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean).join(' - ');
  }
}
