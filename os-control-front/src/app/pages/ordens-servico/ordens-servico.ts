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

type OrdemServicoSalva = {
  id: string;
  numeroOrcamento: string;
  cliente: string;
  veiculo: string;
  status: string;
  tecnico: string;
  dataAbertura: string;
  observacao: string;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
  desconto: string;
  totalOs: string;
};

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
    this.route.paramMap.subscribe((params) => {
      this.reiniciarFormulario();

      const ordemId = params.get('ordemId');
      const orcamentoId = params.get('orcamentoId');

      if (ordemId) {
        this.carregarOrdemExistente(ordemId);
        return;
      }

      if (orcamentoId) {
        this.carregarOrcamentoImportado(orcamentoId);
      }
    });
  }

  get tituloPagina() {
    return this.modoEdicao ? 'Editar OS' : 'Ordens de Servicos';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar OS' : 'Cadastrar OS';
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
    const ordem: OrdemServicoSalva = {
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

    const ordensAtualizadas = this.modoEdicao
      ? ordensSalvas.map((item) => (item.id === ordem.id ? ordem : item))
      : [...ordensSalvas, ordem];

    localStorage.setItem('ordensServicoCadastradas', JSON.stringify(ordensAtualizadas));

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

  private carregarOrdemExistente(id: string) {
    const ordem = this.buscarOrdem(id);

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

    return null;
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
      servicos: this.comoListaServicos(registro['servicos']),
      pecas: this.comoListaPecas(registro['pecas']),
    };
  }

  private buscarOrdem(id: string) {
    return this.carregarOrdensSalvas().find((item) => item.id === id) || null;
  }

  private carregarOrdensSalvas(): OrdemServicoSalva[] {
    const chaves = ['ordensServicoCadastradas', 'ordensServico'];

    for (const chave of chaves) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as OrdemServicoSalva[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  private gerarNumeroOs() {
    const maiorId = this.carregarOrdensSalvas().reduce((maior, item) => {
      const numero = Number.parseInt(item.id, 10);
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return String(maiorId + 1).padStart(2, '0');
  }

  private reiniciarFormulario() {
    this.modoEdicao = false;
    this.numeroOs = this.gerarNumeroOs();
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

  private comoListaServicos(valor: unknown) {
    return Array.isArray(valor)
      ? valor.filter(
          (item): item is ServicoSelecionado =>
            !!item && typeof item === 'object' && typeof (item as { nome?: unknown }).nome === 'string'
        )
      : [];
  }

  private comoListaPecas(valor: unknown) {
    return Array.isArray(valor)
      ? valor.filter(
          (item): item is PecaSelecionada =>
            !!item && typeof item === 'object' && typeof (item as { nome?: unknown }).nome === 'string'
        )
      : [];
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
