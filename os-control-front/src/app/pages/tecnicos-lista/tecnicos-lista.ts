import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TecnicoListaItem } from '../../models/tecnico.model';
import { TecnicosService } from '../../services/tecnicos.service';

@Component({
  selector: 'app-tecnicos-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './tecnicos-lista.html',
  styleUrl: './tecnicos-lista.css',
})
export class TecnicosLista implements OnInit {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroNome = '';
  filtroId = '';
  tecnicos: TecnicoListaItem[] = [];

  constructor(private router: Router, private tecnicosService: TecnicosService) {}

  ngOnInit() {
    this.atualizarTecnicos();
  }

  get tecnicosFiltrados(): TecnicoListaItem[] {
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
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  excluirTecnico(id: string) {
    if (!window.confirm('Deseja excluir tecnico?')) {
      return;
    }

    this.tecnicosService.excluir(id);
    this.atualizarTecnicos();
  }

  private atualizarTecnicos() {
    this.tecnicos = this.tecnicosService.listarParaLista();
  }
}
