import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  cadastroVeiculoAberto: boolean = false;

  constructor(private router: Router) {}

  abrirCadastroVeiculo() {
    this.cadastroVeiculoAberto = true;
  }

  fecharCadastroVeiculo() {
    this.cadastroVeiculoAberto = false;
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
