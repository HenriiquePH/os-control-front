import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { OrdemServicoResumo } from '../../models/ordem-servico.model';
import { OrdensServicoService } from '../../services/ordens-servico.service';

@Component({
  selector: 'app-ordens-servico-visualizar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ordens-servico-visualizar.html',
  styleUrl: './ordens-servico-visualizar.css',
})
export class OrdensServicoVisualizar implements OnInit {
  usuarioLogado: string = localStorage.getItem('usuario') || 'Usuario';
  filtroCliente = '';
  filtroTecnico = '';
  filtroStatus = '';
  ordens: OrdemServicoResumo[] = [];

  constructor(private router: Router, private ordensServicoService: OrdensServicoService) {}

  ngOnInit() {
    this.ordens = this.ordensServicoService.listarParaVisualizacao();
  }

  get ordensFiltradas(): OrdemServicoResumo[] {
    const cliente = this.filtroCliente.trim().toLowerCase();
    const tecnico = this.filtroTecnico.trim().toLowerCase();
    const status = this.filtroStatus.trim().toLowerCase();

    return this.ordens.filter((ordem) => {
      const combinaCliente = !cliente || ordem.cliente.toLowerCase().includes(cliente);
      const combinaTecnico = !tecnico || ordem.tecnico.toLowerCase().includes(tecnico);
      const combinaStatus = !status || ordem.status.toLowerCase().includes(status);

      return combinaCliente && combinaTecnico && combinaStatus;
    });
  }

  get linhasVazias(): undefined[] {
    return Array.from({ length: Math.max(0, 9 - this.ordensFiltradas.length) });
  }

  sair() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
