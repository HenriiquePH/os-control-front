import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

type VeiculoCliente = {
  id: string;
  marca: string;
  placa: string;
  modelo: string;
  ano: string;
};

type ClienteSalvo = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento: string;
  veiculos: VeiculoCliente[];
};

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
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  cadastroVeiculoAberto: boolean = false;
  cliente = {
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
  veiculos: VeiculoCliente[] = [];
  novoVeiculo = {
    marca: '',
    placa: '',
    modelo: '',
    ano: '',
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.carregarCliente(id);
  }

  get tituloPagina() {
    return this.modoEdicao ? 'Editar cliente' : 'Cadastrar cliente';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar cliente' : 'Cadastrar cliente';
  }

  abrirCadastroVeiculo() {
    this.resetNovoVeiculo();
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
    this.resetNovoVeiculo();
  }

  excluirVeiculo(id: string) {
    this.veiculos = this.veiculos.filter((veiculo) => veiculo.id !== id);
  }

  salvarCliente() {
    const clientes = this.carregarClientesSalvos();
    const id = this.clienteId || this.gerarProximoId(clientes);
    const clienteSalvo: ClienteSalvo = {
      id,
      ...this.cliente,
      veiculos: this.veiculos,
    };

    localStorage.setItem(
      'clientesCadastrados',
      JSON.stringify([...clientes.filter((item) => item.id !== id), clienteSalvo])
    );

    this.router.navigate(['/clientes']);
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  private carregarCliente(id: string) {
    const cliente = this.carregarClientesSalvos().find((item) => item.id === id);

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

  private carregarClientesSalvos(): ClienteSalvo[] {
    const chaves = ['clientesCadastrados', 'clientes', 'cadastroClientes'];

    for (const chave of chaves) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as ClienteSalvo[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  private gerarProximoId(clientes: ClienteSalvo[]) {
    return String(clientes.length + 1).padStart(2, '0');
  }

  private resetNovoVeiculo() {
    this.novoVeiculo = {
      marca: '',
      placa: '',
      modelo: '',
      ano: '',
    };
  }
}
