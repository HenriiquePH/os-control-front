import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { ServicoApi, ServicoLista, ServicoSalvo } from '../models/servico.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ServicosService {
  private readonly apiUrl = 'http://localhost:8080/servico';

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<ServicoSalvo[]> {
    return this.http.get<ServicoApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((servicos) => servicos.map((servico) => this.mapearServicoSalvo(servico)))
    );
  }

  listarLista(): Observable<ServicoLista[]> {
    return this.http.get<ServicoApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((servicos) => servicos.map((servico) => this.mapearServicoLista(servico)))
    );
  }

  buscarPorId(id: string): Observable<ServicoSalvo> {
    return this.http.get<ServicoApi>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() }).pipe(
      map((servico) => this.mapearServicoSalvo(servico))
    );
  }

  salvar(servico: ServicoSalvo): Observable<ServicoSalvo> {
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

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() });
  }

  private mapearServicoSalvo(servico: ServicoApi): ServicoSalvo {
    return {
      id: String(servico.id).padStart(2, '0'),
      nome: servico.descricao,
      valor: this.formatarMoeda(servico.valor),
      preco: servico.valor,
    };
  }

  private mapearServicoLista(servico: ServicoApi): ServicoLista {
    return {
      id: String(servico.id).padStart(2, '0'),
      nome: servico.descricao,
      valor: this.formatarMoeda(servico.valor),
    };
  }

  private formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  private obterHeaders() {
    // Por enquanto o token vai direto no service. Depois, o ponto certo para
    // centralizar isso no projeto inteiro e um interceptor.
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.obterToken()}`,
    });
  }
}
