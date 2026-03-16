import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-ordens-servico-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './ordens-servico-menu.html',
  styleUrl: './ordens-servico-menu.css',
})
export class OrdensServicoMenu {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';

  constructor(private router: Router) {}

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
