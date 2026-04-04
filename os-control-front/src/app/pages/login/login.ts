import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  usuario: string = '';
  senha: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  entrar() {
    this.authService.entrar(this.usuario, this.senha).subscribe({
      next: (autenticado) => {
        if (!autenticado) {
          return;
        }

        this.router.navigate(['/home']);
      },
      error: (erro) => {
        // Mantive o tratamento simples para nao mexer no layout.
        // Se o backend responder erro, a tela apenas nao avanca e o detalhe fica no console.
        console.error('Erro ao autenticar no backend.', erro);
      },
    });
  }
}
