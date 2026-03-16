import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Clientes } from './pages/clientes/clientes';
import { ClientesLista } from './pages/clientes-lista/clientes-lista';
import { Veiculos } from './pages/veiculos/veiculos';
import { Pecas } from './pages/pecas/pecas';
import { PecasLista } from './pages/pecas-lista/pecas-lista';
import { Servicos } from './pages/servicos/servicos';
import { ServicosLista } from './pages/servicos-lista/servicos-lista';
import { Orcamentos } from './pages/orcamentos/orcamentos';
import { OrcamentosLista } from './pages/orcamentos-lista/orcamentos-lista';
import { OrdensServico } from './pages/ordens-servico/ordens-servico';
import { OrdensServicoImportar } from './pages/ordens-servico-importar/ordens-servico-importar';
import { OrdensServicoMenu } from './pages/ordens-servico-menu/ordens-servico-menu';
import { OrdensServicoVisualizar } from './pages/ordens-servico-visualizar/ordens-servico-visualizar';
import { Tecnicos } from './pages/tecnicos/tecnicos';
import { TecnicosLista } from './pages/tecnicos-lista/tecnicos-lista';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: 'clientes/novo', component: Clientes },
  { path: 'clientes', component: ClientesLista },
  { path: 'veiculos', component: Veiculos },
  { path: 'tecnicos/novo', component: Tecnicos },
  { path: 'tecnicos', component: TecnicosLista },
  { path: 'pecas/novo', component: Pecas },
  { path: 'pecas', component: PecasLista },
  { path: 'servicos/novo', component: Servicos },
  { path: 'servicos', component: ServicosLista },
  { path: 'orcamentos/novo', component: Orcamentos },
  { path: 'orcamentos', component: OrcamentosLista },
  { path: 'ordens-servico/criar', component: OrdensServico },
  { path: 'ordens-servico/importar', component: OrdensServicoImportar },
  { path: 'ordens-servico/importar/:id', component: OrdensServico },
  { path: 'ordens-servico/visualizar', component: OrdensServicoVisualizar },
  { path: 'ordens-servico', component: OrdensServicoMenu },
  { path: 'ordens-de-servicos', redirectTo: 'ordens-servico', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
