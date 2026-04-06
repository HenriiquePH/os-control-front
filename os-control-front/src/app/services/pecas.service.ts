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

  listar(): Observable<PecaSalva[]> {
    return this.http.get<PecaApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((pecas) => pecas.map((peca) => this.mapearPecaSalva(peca)))
    );
  }

  listarLista(): Observable<PecaLista[]> {
    return this.http.get<PecaApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((pecas) => pecas.map((peca) => this.mapearPecaLista(peca)))
    );
  }

  buscarPorId(id: string): Observable<PecaSalva> {
    return this.http.get<PecaApi>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() }).pipe(
      map((peca) => this.mapearPecaSalva(peca))
    );
  }

  salvar(peca: PecaSalva): Observable<PecaSalva> {
    const dados = {
      descricao: peca.nome,
      valorUnitario: peca.valorUnitario,
    };

    if (!peca.id) {
      return this.http.post<PecaApi>(this.apiUrl, dados, { headers: this.obterHeaders() }).pipe(
        map((novaPeca) => this.mapearPecaSalva(novaPeca))
      );
    }

    return this.http.put<PecaApi>(`${this.apiUrl}/${peca.id}`, dados, { headers: this.obterHeaders() }).pipe(
      map((pecaAtualizada) => this.mapearPecaSalva(pecaAtualizada))
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() });
  }

  private mapearPecaSalva(peca: PecaApi): PecaSalva {
    return {
      id: String(peca.id).padStart(2, '0'),
      nome: peca.descricao,
      valor: this.formatarMoeda(peca.valorUnitario),
      valorUnitario: peca.valorUnitario,
    };
  }

  private mapearPecaLista(peca: PecaApi): PecaLista {
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

  private obterHeaders() {
    // Por enquanto o token vai direto no service. Depois, o ponto certo para
    // centralizar isso no projeto inteiro e um interceptor.
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.obterToken()}`,
    });
  }
}
