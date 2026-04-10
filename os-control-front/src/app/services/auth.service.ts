import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' }) //
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/auth/login'; // URL do endpoint de autenticação no backend
  private readonly CHAVE_USUARIO = 'usuario'; // chaves para armazenar usuário e token
  private readonly CHAVE_TOKEN = 'token'; 

  constructor(private http: HttpClient) {} // define o HttpClient como dependência para fazer requisições HTTP ao backend

 
  entrar(usuario: string, senha: string): Observable<boolean> { // 
    const login = usuario.trim();
    const password = senha.trim();

    if (!login || !password) { // se login ou senha estiverem vazios, retorna um Observable de false sem fazer a requisição
      return of(false);
    }

    return this.http // se login e senha forem válidos, faz a requisição POST para o backend
      .post<LoginResponse>(this.API_URL, { login, password }) // envia login e senha no corpo da requisição
      .pipe( // usa pipe para processar a resposta
        tap(response => this.salvarSessao(login, response.token)), // se a resposta for bem-sucedida, salva a sessão com o login e token retornados
        map(() => true) // mapeia a resposta para true, indicando que o login foi bem-sucedido
      );
  }

  // Salva usuário e token no localStorage
   
  private salvarSessao(usuario: string, token?: string): void {
    localStorage.setItem(this.CHAVE_USUARIO, usuario);
    
    if (token) { // se tiver token, salva no localStorage, caso contrário remove qualquer token existente para evitar inconsistências
      localStorage.setItem(this.CHAVE_TOKEN, token);
    } else { // se não tiver token, remove qualquer token existente para evitar inconsistências
      localStorage.removeItem(this.CHAVE_TOKEN);
    }
  }

  //Retorna o usuário salvo ou 'Usuario' padrão
  obterUsuario(): string {
    return localStorage.getItem(this.CHAVE_USUARIO) || 'Usuario';
  }

  // Retorna o token salvo ou string vazia
  obterToken(): string {
    return localStorage.getItem(this.CHAVE_TOKEN) || '';
  }

  // Limpa a sessão removendo usuário e token do localStorage
  sair(): void {
    localStorage.removeItem(this.CHAVE_USUARIO);
    localStorage.removeItem(this.CHAVE_TOKEN);
  }
}