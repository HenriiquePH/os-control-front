import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PecaApi, PecaLista, PecaSalva } from '../models/peca.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PecasService {
  private readonly apiUrl = 'http://localhost:8080/peca';

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<PecaSalva[]> { // retorna a lista completa de peças, mapeando os dados da peça para o formato de salvo, formatando o valor como moeda e mantendo o valor numérico para edição
    return this.http.get<PecaApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((pecas) => pecas.map((peca) => this.mapearPecaSalva(peca)))
    );
  }

  listarLista(): Observable<PecaLista[]> { // retorna a lista de peças para exibição na tabela, mapeando os dados da peça para o formato de lista, formatando o valor como moeda
    return this.http.get<PecaApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((pecas) => pecas.map((peca) => this.mapearPecaLista(peca)))
    );
  }

  buscarPorId(id: string): Observable<PecaSalva> { // busca uma peça específica por ID, fazendo uma requisição GET para o backend e mapeando os dados da peça para o formato de salvo, formatando o valor como moeda e mantendo o valor numérico para edição
    return this.http.get<PecaApi>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() }).pipe(
      map((peca) => this.mapearPecaSalva(peca))
    );
  }

  salvar(peca: PecaSalva): Observable<PecaSalva> { // prepara os dados da peça para salvar, verificando se é um novo cadastro ou uma atualização, e fazendo a requisição POST ou PUT para o backend com os headers de autenticação
    const dados = { 
      descricao: peca.nome,
      valorUnitario: peca.valorUnitario,
    };

    if (!peca.id) { // se não tiver ID, é um novo cadastro, então faz a requisição POST para criar a nova peça
      return this.http.post<PecaApi>(this.apiUrl, dados, { headers: this.obterHeaders() }).pipe(
        map((novaPeca) => this.mapearPecaSalva(novaPeca))
      );
    }

    return this.http.put<PecaApi>(`${this.apiUrl}/${peca.id}`, dados, { headers: this.obterHeaders() }).pipe(
      map((pecaAtualizada) => this.mapearPecaSalva(pecaAtualizada))
    );
  }

  excluir(id: string): Observable<void> { // envia uma requisição DELETE para o backend para excluir a peça com o ID especificado, usando os headers de autenticação
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() });
  }

  private mapearPecaSalva(peca: PecaApi): PecaSalva { // mapeia os dados da peça para o formato de salvo, formatando o valor como moeda e mantendo o valor numérico para edição
    return {
      id: String(peca.id).padStart(2, '0'),
      nome: peca.descricao,
      valor: this.formatarMoeda(peca.valorUnitario),
      valorUnitario: peca.valorUnitario,
    };
  }

  private mapearPecaLista(peca: PecaApi): PecaLista { // mapeia os dados da peça para o formato de lista, formatando o valor como moeda
    return {
      id: String(peca.id).padStart(2, '0'),
      nome: peca.descricao,
      valor: this.formatarMoeda(peca.valorUnitario),
    };
  }

  private formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  private obterHeaders() { //  inclui o token de autenticação no header Authorization para as requisições ao backend, usando o formato Bearer token
    
    return new HttpHeaders({ // inclui o token de autenticação no header Authorization para as requisições ao backend, usando o formato Bearer token
      Authorization: `Bearer ${this.authService.obterToken()}`,
    });
  }
}
