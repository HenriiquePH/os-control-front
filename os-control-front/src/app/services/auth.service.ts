import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/auth/login';
  private readonly CHAVE_USUARIO = 'usuario';
  private readonly CHAVE_TOKEN = 'token';
  private readonly CHAVE_PERFIL = 'perfil';

  constructor(private http: HttpClient) {}

  entrar(usuario: string, senha: string): Observable<boolean> {
    const login = usuario.trim();
    const password = senha.trim();

    if (!login || !password) {
      return of(false);
    }

    return this.http.post<LoginResponse>(this.API_URL, { login, password }).pipe(
      tap((response) => this.salvarSessao(login, response.token, response.perfil)),
      map(() => true)
    );
  }

  private salvarSessao(usuario: string, token?: string, perfil?: string): void {
    localStorage.setItem(this.CHAVE_USUARIO, usuario);

    if (token) {
      localStorage.setItem(this.CHAVE_TOKEN, token);
    } else {
      localStorage.removeItem(this.CHAVE_TOKEN);
    }

    if (perfil) {
      localStorage.setItem(this.CHAVE_PERFIL, perfil);
    } else {
      localStorage.removeItem(this.CHAVE_PERFIL);
    }
  }

  obterUsuario(): string {
    return localStorage.getItem(this.CHAVE_USUARIO) || 'Usuario';
  }

  obterToken(): string {
    return localStorage.getItem(this.CHAVE_TOKEN) || '';
  }

  obterPerfil(): string {
    return localStorage.getItem(this.CHAVE_PERFIL) || '';
  }

  estaAutenticado(): boolean {
    return this.obterToken().trim().length > 0;
  }

  ehAdmin(): boolean {
    return this.obterPerfil() === 'ROLE_ADMIN';
  }

  sair(): void {
    localStorage.removeItem(this.CHAVE_USUARIO);
    localStorage.removeItem(this.CHAVE_TOKEN);
    localStorage.removeItem(this.CHAVE_PERFIL);
  }
}
