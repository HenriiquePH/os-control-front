import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { TecnicoApi, TecnicoLista, TecnicoSalvo } from '../models/tecnico.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TecnicosService {
  private readonly apiUrl = 'http://localhost:8080/usuario';

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<TecnicoSalvo[]> {
    return this.http.get<TecnicoApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((usuarios) =>
        usuarios.filter((usuario) => this.ehTecnico(usuario)).map((usuario) => this.mapearTecnicoSalvo(usuario))
      )
    );
  }

  listarLista(): Observable<TecnicoLista[]> {
    return this.http.get<TecnicoApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((usuarios) =>
        usuarios.filter((usuario) => this.ehTecnico(usuario)).map((usuario) => this.mapearTecnicoLista(usuario))
      )
    );
  }

  listarNomes(): Observable<string[]> {
    return this.http.get<TecnicoApi[]>(this.apiUrl, { headers: this.obterHeaders() }).pipe(
      map((usuarios) =>
        usuarios
          .filter((usuario) => this.ehTecnico(usuario))
          .map((usuario) => usuario.nome.trim())
          .filter((nome) => nome.length > 0)
      )
    );
  }

  buscarPorId(id: string): Observable<TecnicoSalvo> {
    return this.http.get<TecnicoApi>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() }).pipe(
      map((usuario) => this.mapearTecnicoSalvo(usuario))
    );
  }

  salvar(tecnico: TecnicoSalvo): Observable<TecnicoSalvo> {
    const senha = tecnico.senha.trim();
    const dados: Record<string, unknown> = {
      nome: tecnico.nome,
      cpf: tecnico.cpf,
      telefone: tecnico.telefone,
      login: tecnico.usuario,
      perfil: 'ROLE_USUARIO',
    };

    if (!tecnico.id || senha) {
      dados['senha'] = senha;
    }

    if (!tecnico.id) {
      return this.http.post<TecnicoApi>(this.apiUrl, dados, { headers: this.obterHeaders() }).pipe(
        map((novoTecnico) => this.mapearTecnicoSalvo(novoTecnico))
      );
    }

    return this.http.put<TecnicoApi>(`${this.apiUrl}/${tecnico.id}`, dados, { headers: this.obterHeaders() }).pipe(
      map((tecnicoAtualizado) => this.mapearTecnicoSalvo(tecnicoAtualizado))
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.obterHeaders() });
  }

  private mapearTecnicoSalvo(usuario: TecnicoApi): TecnicoSalvo {
    return {
      id: String(usuario.id).padStart(2, '0'),
      nome: usuario.nome,
      cpf: usuario.cpf,
      telefone: usuario.telefone,
      usuario: usuario.login,
      senha: '',
    };
  }

  private mapearTecnicoLista(usuario: TecnicoApi): TecnicoLista {
    return {
      id: String(usuario.id).padStart(2, '0'),
      nome: usuario.nome,
      telefone: usuario.telefone || '--',
    };
  }

  private ehTecnico(usuario: TecnicoApi) {
    return usuario.perfil === 'ROLE_USUARIO';
  }

  private obterHeaders() {
    // Por enquanto o token vai direto no service. Depois, o ponto certo para
    // centralizar isso no projeto inteiro e um interceptor.
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.obterToken()}`,
    });
  }
}
