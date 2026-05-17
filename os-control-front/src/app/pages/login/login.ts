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
export class Login { // responsavel por exibir e chamar a autenticação do usuario
  usuario: string = '';
  senha: string = '';

  constructor(private router: Router, private authService: AuthService) {} // recebe o AuthService via injeção de dependência
  // router é para mudar de pagina apos o login, authService é para chamar o método de autenticação no back
  
  entrar() { //
    this.authService.entrar(this.usuario, this.senha).subscribe({ // chama o método entrar do AuthService, passando usuario e senha
      next: (autenticado) => {  // se autenticado for false, retorna sem fazer nada
        if (!autenticado) {
          return; // se autenticado for true, continua para navegar para a home
        }

        this.router.navigate(['/home']);// joga o usuario para home apos o login, caso seja autenticado com sucesso
      },
      error: (erro) => {

        console.error('Erro ao autenticar no backend.', erro); 
      },
    });
  }
}
