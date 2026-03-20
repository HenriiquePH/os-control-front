import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

type TecnicoSalvo = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  usuario: string;
  senha: string;
};

@Component({
  selector: 'app-tecnicos',
  imports: [FormsModule, RouterLink],
  templateUrl: './tecnicos.html',
  styleUrl: './tecnicos.css',
})
export class Tecnicos implements OnInit {
  modoEdicao: boolean = false;
  tecnicoId: string = '';
  tecnico = {
    nome: '',
    cpf: '',
    telefone: '',
    usuario: '',
    senha: '',
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.carregarTecnico(id);
  }

  get tituloPagina() {
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

    const tecnicos = this.carregarTecnicos();
    const id = this.tecnicoId || this.gerarProximoId(tecnicos);
    const tecnicoSalvo: TecnicoSalvo = {
      id,
      nome,
      cpf: this.tecnico.cpf.trim(),
      telefone: this.tecnico.telefone.trim(),
      usuario: this.tecnico.usuario.trim(),
      senha: this.tecnico.senha,
    };

    const tecnicosAtualizados = this.modoEdicao
      ? tecnicos.map((item) => (item.id === id ? tecnicoSalvo : item))
      : [...tecnicos, tecnicoSalvo];

    localStorage.setItem('tecnicosCadastrados', JSON.stringify(tecnicosAtualizados));

    this.router.navigate(['/tecnicos']);
  }

  private carregarTecnico(id: string) {
    const tecnico = this.carregarTecnicos().find((item) => item.id === id);

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

  private carregarTecnicos(): TecnicoSalvo[] {
    const chaves = ['tecnicosCadastrados', 'tecnicos', 'cadastroTecnicos'];

    for (const chave of chaves) {
      const valor = localStorage.getItem(chave);

      if (!valor) {
        continue;
      }

      try {
        const dados = JSON.parse(valor);
        return Array.isArray(dados) ? (dados as TecnicoSalvo[]) : [];
      } catch {
        continue;
      }
    }

    return [];
  }

  private gerarProximoId(tecnicos: TecnicoSalvo[]) {
    const maiorId = tecnicos.reduce((maior, item) => {
      const numero = Number.parseInt(item.id, 10);
      return Number.isFinite(numero) ? Math.max(maior, numero) : maior;
    }, 0);

    return String(maiorId + 1).padStart(2, '0');
  }
}
