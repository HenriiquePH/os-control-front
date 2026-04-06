import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';

import { AuthService } from './auth.service';
import {
  CidadeApi,
  ClienteApi,
  ClienteLista,
  ClienteSalvo,
  Veiculo,
  VeiculoApi,
} from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private readonly apiUrl = 'http://localhost:8080/cliente';
  private readonly cidadesUrl = 'http://localhost:8080/cidade';

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
    return this.montarPayload(cliente).pipe(
      switchMap((dados) => {
        if (!cliente.id) {
          return this.http.post<ClienteApi>(this.apiUrl, dados, { headers: this.obterHeaders() });
        }

        return this.http.put<ClienteApi>(`${this.apiUrl}/${cliente.id}`, dados, { headers: this.obterHeaders() });
      }),
      map((clienteSalvo) => this.mapearCliente(clienteSalvo))
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() });
  }

  private montarPayload(cliente: ClienteSalvo): Observable<Omit<ClienteApi, 'id'>> {
    return this.resolverCidade(cliente.cidade, cliente.estado).pipe(
      map((cidade) => ({
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
          cidade,
        },
        veiculos: cliente.veiculos.map((veiculo) => this.mapearVeiculoApi(veiculo)),
      }))
    );
  }

  private resolverCidade(nomeCidade: string, nomeEstado: string): Observable<CidadeApi | null> {
    const cidade = nomeCidade.trim();
    const estado = nomeEstado.trim();

    if (!cidade) {
      return of(null);
    }

    // Cliente no backend precisa receber a cidade pelo id. Aqui o service
    // procura a cidade cadastrada antes de montar o payload final.
    return this.http.get<CidadeApi[]>(this.cidadesUrl, { headers: this.obterHeaders() }).pipe(
      map((cidades) => {
        const cidadeEncontrada = cidades.find((item) => {
          const mesmoNome = this.normalizar(item.nome) === this.normalizar(cidade);
          const mesmoEstado =
            !estado || this.normalizar(item.estado?.nome) === this.normalizar(estado);

          return mesmoNome && mesmoEstado;
        });

        if (!cidadeEncontrada) {
          throw new Error('Cidade não encontrada no backend.');
        }

        return cidadeEncontrada;
      })
    );
  }

  private mapearCliente(cliente: ClienteApi): ClienteSalvo {
    return {
      id: String(cliente.id).padStart(2, '0'),
      nome: cliente.nome ?? '',
      cpf: cliente.cpf ?? '',
      telefone: cliente.telefone ?? '',
      rua: cliente.endereco?.rua ?? '',
      bairro: cliente.endereco?.bairro ?? '',
      cidade: cliente.endereco?.cidade?.nome ?? '',
      estado: cliente.endereco?.cidade?.estado?.nome ?? '',
      cep: cliente.endereco?.cep ?? '',
      complemento: cliente.endereco?.complemento ?? '',
      veiculos: Array.isArray(cliente.veiculos) ? cliente.veiculos.map((veiculo) => this.mapearVeiculo(veiculo)) : [],
      enderecoId: cliente.endereco?.id,
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

  private normalizar(valor?: string | null) {
    return (valor ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private obterHeaders() {
    // Por enquanto o token vai direto no service. Depois, o ponto certo para
    // centralizar isso no projeto inteiro e um interceptor.
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.obterToken()}`,
    });
  }
}
