import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  usuarioLogado: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.usuarioLogado = this.authService.obterUsuario();
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/login']);
  }
}
