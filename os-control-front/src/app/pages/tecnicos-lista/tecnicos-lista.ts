import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TecnicoLista } from '../../models/tecnico.model';
import { AuthService } from '../../services/auth.service';
import { TecnicosService } from '../../services/tecnicos.service';

@Component({
  selector: 'app-tecnicos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './tecnicos-lista.html',
  styleUrl: './tecnicos-lista.css',
})
export class TecnicosLista implements OnInit {
  usuarioLogado: string = 'Usuario';
  filtroNome = '';
  filtroId = '';
  tecnicos: TecnicoLista[] = [];

  constructor(private router: Router, private tecnicosService: TecnicosService, private authService: AuthService) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  ngOnInit() {
    this.atualizarTecnicos();
  }

  get tecnicosFiltrados(): TecnicoLista[] {
    const nome = this.filtroNome.trim().toLowerCase();
    const id = this.filtroId.trim().toLowerCase();

    return this.tecnicos.filter((tecnico) => {
      const combinaNome = !nome || tecnico.nome.toLowerCase().includes(nome);
      const combinaId = !id || tecnico.id.toLowerCase().includes(id);

      return combinaNome && combinaId;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.tecnicosFiltrados.length) });
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }

  excluirTecnico(id: string) {
    if (!window.confirm('Deseja excluir tecnico?')) {
      return;
    }

    this.tecnicosService.excluir(id).subscribe({
      next: () => this.atualizarTecnicos(),
      error: (erro) => {
        console.error('Não foi possível excluir o técnico.', erro);
      },
    });
  }

  private atualizarTecnicos() {
    this.tecnicosService.listarLista().subscribe({
      next: (tecnicos) => {
        this.tecnicos = tecnicos;
      },
      error: (erro) => {
        console.error('Não foi possível carregar os técnicos.', erro);
        this.tecnicos = [];
      },
    });
  }
}
