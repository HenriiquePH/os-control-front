import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {}

  entrar() {
    if (this.usuario && this.senha) {
      localStorage.setItem('usuario', this.usuario);
      this.router.navigate(['/home']);
    }
  }
}
