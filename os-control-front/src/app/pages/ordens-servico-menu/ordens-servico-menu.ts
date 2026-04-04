import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ordens-servico-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './ordens-servico-menu.html',
  styleUrl: './ordens-servico-menu.css',
})
export class OrdensServicoMenu {
  usuarioLogado: string = 'Usuario';

  constructor(private router: Router, private authService: AuthService) {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }
}
