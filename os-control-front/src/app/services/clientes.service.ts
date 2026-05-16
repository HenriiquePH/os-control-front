import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { AuthService } from './auth.service';
import {
  CidadeApi,
  ClienteApi,
  ClienteLista,
  ClienteSalvo,
  EnderecoApi,
  EstadoApi,
  Veiculo,
  VeiculoApi,
} from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private readonly apiUrl = 'http://localhost:8080/cliente';

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<ClienteSalvo[]> {
    return this.http.get<ClienteApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((clientes) => clientes.map((cliente) => this.mapearCliente(cliente)))
    );
  }

  listarLista(): Observable<ClienteLista[]> {
    return this.listar().pipe(map((clientes) => clientes.map((cliente) => this.mapearLista(cliente))));
  }

  buscarPorId(id: string): Observable<ClienteSalvo> {
    return this.http.get<ClienteApi>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() }).pipe(
      map((cliente) => this.mapearCliente(cliente))
    );
  }

  salvar(cliente: ClienteSalvo): Observable<ClienteSalvo> {
    const dados = this.montarPayload(cliente);
    const requisicao = !cliente.id
      ? this.http.post<ClienteApi>(this.apiUrl, dados, { headers: this.obterHeaders() })
      : this.http.put<ClienteApi>(`${this.apiUrl}/${cliente.id}`, dados, { headers: this.obterHeaders() });

    return requisicao.pipe(map((clienteSalvo) => this.mapearCliente(clienteSalvo)));
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() });
  }

  private montarPayload(cliente: ClienteSalvo) {
    const cidade = cliente.cidade.trim();
    const estado = cliente.estado.trim().toUpperCase();

    return {
      nome: cliente.nome.trim(),
      cpf: cliente.cpf.trim(),
      telefone: cliente.telefone.trim(),
      email: '',
      endereco: {
        ...(cliente.enderecoId ? { id: cliente.enderecoId } : {}),
        rua: cliente.rua.trim(),
        bairro: cliente.bairro.trim(),
        cep: cliente.cep.trim(),
        complemento: cliente.complemento.trim(),
        cidade: cidade
          ? {
              nome: cidade,
              estado: estado ? { uf: estado } : null,
            }
          : null,
      },
      veiculos: cliente.veiculos.map((veiculo) => this.mapearVeiculoApi(veiculo)),
    };
  }

  private mapearCliente(cliente: ClienteApi): ClienteSalvo {
    const endereco = cliente.endereco;

    return {
      id: String(cliente.id).padStart(2, '0'),
      nome: cliente.nome ?? '',
      cpf: cliente.cpf ?? '',
      telefone: cliente.telefone ?? '',
      rua: endereco?.rua ?? '',
      bairro: endereco?.bairro ?? '',
      cidade: this.extrairNomeCidade(endereco),
      estado: this.extrairEstado(endereco),
      cep: endereco?.cep ?? '',
      complemento: endereco?.complemento ?? '',
      veiculos: Array.isArray(cliente.veiculos) ? cliente.veiculos.map((veiculo) => this.mapearVeiculo(veiculo)) : [],
      enderecoId: endereco?.id,
    };
  }

  private mapearLista(cliente: ClienteSalvo): ClienteLista {
    const primeiroVeiculo = cliente.veiculos[0];
    const veiculo = primeiroVeiculo ? [primeiroVeiculo.marca, primeiroVeiculo.modelo].filter(Boolean).join(' ') : '--';

    return {
      id: cliente.id,
      nome: cliente.nome || '--',
      telefone: cliente.telefone || '--',
      cidade: cliente.cidade || '--',
      veiculo: veiculo || '--',
    };
  }

  private mapearVeiculo(veiculo: VeiculoApi): Veiculo {
    return {
      id: veiculo.id ? String(veiculo.id) : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      marca: veiculo.marca ?? '',
      placa: veiculo.placa ?? '',
      modelo: veiculo.modelo ?? '',
      ano: veiculo.ano ? String(veiculo.ano) : '',
    };
  }

  private mapearVeiculoApi(veiculo: Veiculo): VeiculoApi {
    const id = Number(veiculo.id);
    const ano = Number(veiculo.ano);

    return {
      ...(Number.isInteger(id) ? { id } : {}),
      marca: veiculo.marca.trim(),
      placa: veiculo.placa.trim(),
      modelo: veiculo.modelo.trim(),
      ano: Number.isInteger(ano) ? ano : null,
      cor: null,
    };
  }

  private extrairNomeCidade(endereco: EnderecoApi | null | undefined) {
    const cidade = endereco?.cidade;

    if (!cidade) {
      return '';
    }

    return typeof cidade === 'string' ? cidade : cidade.nome ?? '';
  }

  private extrairEstado(endereco: EnderecoApi | null | undefined) {
    const estadoDireto = endereco?.estado;

    if (estadoDireto) {
      return this.formatarEstado(estadoDireto);
    }

    const cidade = endereco?.cidade;

    if (!cidade || typeof cidade === 'string') {
      return '';
    }

    return this.formatarEstado(cidade.estado);
  }

  private formatarEstado(estado: EstadoApi | string | null | undefined) {
    if (!estado) {
      return '';
    }

    return typeof estado === 'string' ? estado : estado.uf ?? estado.nome ?? '';
  }

  private obterHeaders() {
    // Por enquanto o token vai direto no service. Depois, o ponto certo para
    // centralizar isso no projeto inteiro e um interceptor.
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.obterToken()}`,
    });
  }
}
