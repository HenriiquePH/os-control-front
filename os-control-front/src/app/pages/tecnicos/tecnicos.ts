import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TecnicoFormulario, TecnicoSalvo } from '../../models/tecnico.model';
import { TecnicosService } from '../../services/tecnicos.service';

@Component({
  selector: 'app-tecnicos',
  imports: [FormsModule, RouterLink],
  templateUrl: './tecnicos.html',
  styleUrl: './tecnicos.css',
})
export class Tecnicos implements OnInit {
  modoEdicao: boolean = false;
  tecnicoId: string = '';
  tecnico: TecnicoFormulario = {
    nome: '',
    cpf: '',
    telefone: '',
    usuario: '',
    senha: '',
  };

  constructor(private router: Router, private route: ActivatedRoute, private tecnicosService: TecnicosService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.carregarTecnico(id);
  }

  get titulo() {
    return this.modoEdicao ? 'Editar Tecnico' : 'Cadastro de Tecnico';
  }

  get textoBotao() {
    return this.modoEdicao ? 'Salvar' : 'Cadastrar';
  }

  salvarTecnico() {
    const nome = this.tecnico.nome.trim();

    if (!nome) {
      return;
    }

    const id = this.tecnicoId || this.tecnicosService.gerarProximoId();
    const tecnicoSalvo: TecnicoSalvo = {
      id,
      nome,
      cpf: this.tecnico.cpf.trim(),
      telefone: this.tecnico.telefone.trim(),
      usuario: this.tecnico.usuario.trim(),
      senha: this.tecnico.senha,
    };

    this.tecnicosService.salvar(tecnicoSalvo);
    this.router.navigate(['/tecnicos']);
  }

  private carregarTecnico(id: string) {
    const tecnico = this.tecnicosService.buscarPorId(id);

    if (!tecnico) {
      return;
    }

    this.modoEdicao = true;
    this.tecnicoId = tecnico.id;
    this.tecnico = {
      nome: tecnico.nome,
      cpf: tecnico.cpf,
      telefone: tecnico.telefone,
      usuario: tecnico.usuario,
      senha: tecnico.senha,
    };
  }
}
