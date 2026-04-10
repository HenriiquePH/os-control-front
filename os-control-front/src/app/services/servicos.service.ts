import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // importa os módulos necessários para fazer requisições HTTP e injeção de dependências
import { Observable, map } from 'rxjs'; // importa os módulos para trabalhar com Observables e operadores de transformação de dados
import { ServicoApi, ServicoLista, ServicoSalvo } from '../models/servico.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ServicosService {
  private readonly apiUrl = 'http://localhost:8080/servico'; // URL base para as requisições relacionadas aos serviços, apontando para o endpoint de serviços no backend

  constructor(private http: HttpClient, private authService: AuthService) {} //

  listar(): Observable<ServicoSalvo[]> { // retorna a lista completa de serviços, mapeando os dados do serviço para o formato de salvo, formatando o valor como moeda e mantendo o valor numérico para edição
    return this.http.get<ServicoApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((servicos) => servicos.map((servico) => this.mapearServicoSalvo(servico)))
    );
  }

  listarLista(): Observable<ServicoLista[]> { // retorna a lista de serviços para exibição na tabela, mapeando os dados do serviço para o formato de lista, formatando o valor como moeda
    return this.http.get<ServicoApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((servicos) => servicos.map((servico) => this.mapearServicoLista(servico)))
    );
  }

  buscarPorId(id: string): Observable<ServicoSalvo> { // busca um serviço específico por ID, fazendo uma requisição GET para o backend e mapeando os dados do serviço para o formato de salvo, formatando o valor como moeda e mantendo o valor numérico para edição
    return this.http.get<ServicoApi>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() }).pipe(
      map((servico) => this.mapearServicoSalvo(servico))
    );
  }

  salvar(servico: ServicoSalvo): Observable<ServicoSalvo> { // prepara os dados do serviço para salvar, verificando se é um novo cadastro ou uma atualização, e fazendo a requisição POST ou PUT para o backend com os headers de autenticação
    const dados = {
      descricao: servico.nome,
      valor: servico.preco,
    };

    if (!servico.id) {
      return this.http.post<ServicoApi>(this.apiUrl, dados, { headers: this.obterHeaders() }).pipe(
        map((novoServico) => this.mapearServicoSalvo(novoServico))
      );
    }

    return this.http.put<ServicoApi>(`${this.apiUrl}/${servico.id}`, dados, { headers: this.obterHeaders() }).pipe(
      map((servicoAtualizado) => this.mapearServicoSalvo(servicoAtualizado))
    );
  }

  excluir(id: string): Observable<void> { // envia uma requisição DELETE para o backend para excluir o serviço com o ID especificado, usando os headers de autenticação
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() });
  }

  private mapearServicoSalvo(servico: ServicoApi): ServicoSalvo { // mapeia os dados do serviço para o formato de salvo, formatando o valor como moeda e mantendo o valor numérico para edição
    return {
      id: String(servico.id).padStart(2, '0'),
      nome: servico.descricao,
      valor: this.formatarMoeda(servico.valor),
      preco: servico.valor,
    };
  }

  private mapearServicoLista(servico: ServicoApi): ServicoLista { // mapeia os dados do serviço para o formato de lista, formatando o valor como moeda
    return {
      id: String(servico.id).padStart(2, '0'),
      nome: servico.descricao,
      valor: this.formatarMoeda(servico.valor),
    };
  }

  private formatarMoeda(valor: number) { // formata o valor numérico para o formato de moeda brasileira, usando a API Intl.NumberFormat para garantir a formatação correta
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  private obterHeaders() { // retorna os headers necessários para as requisições, incluindo o token de autenticação obtido do AuthService
    
    return new HttpHeaders({ // cria um novo HttpHeaders com o token de autenticação no formato Bearer
      Authorization: `Bearer ${this.authService.obterToken()}`,
    });
  }
}
