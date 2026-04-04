import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ClienteFormulario, ClienteSalvo, NovoVeiculo, Veiculo } from '../../models/cliente.model';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  modoEdicao: boolean = false;
  clienteId: string = '';
  usuarioLogado: string = 'Usuario';
  cadastroVeiculoAberto: boolean = false;
  cliente: ClienteFormulario = {
    nome: '',
    cpf: '',
    telefone: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    complemento: '',
  };
  veiculos: Veiculo[] = [];
  novoVeiculo: NovoVeiculo = {
    marca: '',
    placa: '',
    modelo: '',
    ano: '',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientesService: ClientesService,
    private authService: AuthService
  ) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.carregarCliente(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar cliente' : 'Cadastrar cliente';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar cliente' : 'Cadastrar cliente';
  }

  abrirCadastroVeiculo() {
    this.limparNovoVeiculo();
    this.cadastroVeiculoAberto = true;
  }

  fecharCadastroVeiculo() {
    this.cadastroVeiculoAberto = false;
  }

  adicionarVeiculo() {
    const marca = this.novoVeiculo.marca.trim();
    const placa = this.novoVeiculo.placa.trim();
    const modelo = this.novoVeiculo.modelo.trim();
    const ano = this.novoVeiculo.ano.trim();

    if (!marca && !placa && !modelo && !ano) {
      return;
    }

    this.veiculos = [
      ...this.veiculos,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        marca,
        placa,
        modelo,
        ano,
      },
    ];

    this.fecharCadastroVeiculo();
    this.limparNovoVeiculo();
  }

  excluirVeiculo(id: string) {
    this.veiculos = this.veiculos.filter((veiculo) => veiculo.id !== id);
  }

  salvarCliente() {
    const id = this.clienteId || this.clientesService.gerarProximoId();
    const clienteSalvo: ClienteSalvo = {
      id,
      ...this.cliente,
      veiculos: this.veiculos,
    };

    this.clientesService.salvar(clienteSalvo);
    this.router.navigate(['/clientes']);
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }

  private carregarCliente(id: string) {
    const cliente = this.clientesService.buscarPorId(id);

    if (!cliente) {
      return;
    }

    this.modoEdicao = true;
    this.clienteId = cliente.id;
    this.cliente = {
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      rua: cliente.rua,
      bairro: cliente.bairro,
      cidade: cliente.cidade,
      estado: cliente.estado,
      cep: cliente.cep,
      complemento: cliente.complemento,
    };
    this.veiculos = Array.isArray(cliente.veiculos) ? cliente.veiculos : [];
  }

  private limparNovoVeiculo() {
    this.novoVeiculo = {
      marca: '',
      placa: '',
      modelo: '',
      ano: '',
    };
  }
}
