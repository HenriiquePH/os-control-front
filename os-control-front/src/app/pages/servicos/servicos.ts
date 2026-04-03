import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicoFormulario, ServicoSalvo } from '../../models/servico.model';
import { ServicosService } from '../../services/servicos.service';

@Component({
  selector: 'app-servicos',
  imports: [FormsModule, RouterLink],
  templateUrl: './servicos.html',
  styleUrl: './servicos.css',
})
export class Servicos implements OnInit {
  modoEdicao: boolean = false;
  servicoId: string = '';
  servico: ServicoFormulario = {
    nome: '',
    valor: '',
  };

  constructor(private router: Router, private route: ActivatedRoute, private servicosService: ServicosService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.prepararNovoCadastro();
      return;
    }

    this.carregarServico(id);
  }

  get tituloPagina() {
    return this.modoEdicao ? 'Editar servico' : 'Cadastrar serviço';
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

    const id = this.servicoId || this.servicosService.gerarProximoId();
    const servicoSalvo: ServicoSalvo = {
      id,
      nome,
      valor: this.formatarMoeda(valor),
      preco: valor,
    };

    this.servicosService.salvar(servicoSalvo);
    this.router.navigate(['/servicos']);
  }

  private carregarServico(id: string) {
    const servico = this.servicosService.buscarPorId(id);

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
    this.servicoId = this.servicosService.gerarProximoId();
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
}
