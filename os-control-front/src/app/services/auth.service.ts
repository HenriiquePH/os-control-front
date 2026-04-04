import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly chaveUsuario = 'usuario';
  private readonly chaveToken = 'token';
  private readonly apiUrl = 'http://localhost:8080/auth/login';

  constructor(private http: HttpClient) {}

  entrar(usuario: string, senha: string): Observable<boolean> {
    const login = usuario.trim();
    const password = senha.trim();

    if (!login || !password) {
      return of(false);
    }

    // O backend atual espera exatamente { login, password } em /auth/login
    // e responde com { token }. Mantemos o login digitado salvo na sessao
    // para o topo continuar funcionando enquanto o backend nao devolve os dados do usuario.
    const dados: LoginRequest = { login, password };

    return this.http.post<LoginResponse>(this.apiUrl, dados).pipe(
      tap((resposta) => this.salvarSessao(login, resposta.token)),
      map(() => true)
    );
  }

  salvarSessao(usuario: string, token = '') {
    localStorage.setItem(this.chaveUsuario, usuario);

    if (token) {
      localStorage.setItem(this.chaveToken, token);
      return;
    }

    localStorage.removeItem(this.chaveToken);
  }

  obterUsuario() {
    return localStorage.getItem(this.chaveUsuario) || 'Usuario';
  }

  obterToken() {
    return localStorage.getItem(this.chaveToken) || '';
  }

  sair() {
    localStorage.removeItem(this.chaveUsuario);
    localStorage.removeItem(this.chaveToken);
  }
}
