import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Clientes } from './pages/clientes/clientes';
import { ClientesLista } from './pages/clientes-lista/clientes-lista';
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
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'clientes/novo', component: Clientes, canActivate: [authGuard, adminGuard] },
  { path: 'clientes/editar/:id', component: Clientes, canActivate: [authGuard, adminGuard] },
  { path: 'clientes', component: ClientesLista, canActivate: [authGuard, adminGuard] },
  { path: 'tecnicos/novo', component: Tecnicos, canActivate: [authGuard, adminGuard] },
  { path: 'tecnicos/editar/:id', component: Tecnicos, canActivate: [authGuard, adminGuard] },
  { path: 'tecnicos', component: TecnicosLista, canActivate: [authGuard, adminGuard] },
  { path: 'pecas/novo', component: Pecas, canActivate: [authGuard, adminGuard] },
  { path: 'pecas/editar/:id', component: Pecas, canActivate: [authGuard, adminGuard] },
  { path: 'pecas', component: PecasLista, canActivate: [authGuard, adminGuard] },
  { path: 'servicos/novo', component: Servicos, canActivate: [authGuard, adminGuard] },
  { path: 'servicos/editar/:id', component: Servicos, canActivate: [authGuard, adminGuard] },
  { path: 'servicos', component: ServicosLista, canActivate: [authGuard, adminGuard] },
  { path: 'orcamentos/novo', component: Orcamentos, canActivate: [authGuard] },
  { path: 'orcamentos/editar/:orcamentoId', component: Orcamentos, canActivate: [authGuard] },
  { path: 'orcamentos', component: OrcamentosLista, canActivate: [authGuard] },
  { path: 'ordens-servico/criar', component: OrdensServico, canActivate: [authGuard] },
  { path: 'ordens-servico/importar', component: OrdensServicoImportar, canActivate: [authGuard] },
  { path: 'ordens-servico/importar/:orcamentoId', component: OrdensServico, canActivate: [authGuard] },
  { path: 'ordens-servico/editar/:ordemId', component: OrdensServico, canActivate: [authGuard] },
  { path: 'ordens-servico/visualizar', component: OrdensServicoVisualizar, canActivate: [authGuard] },
  { path: 'ordens-servico', component: OrdensServicoMenu, canActivate: [authGuard] },
  { path: 'ordens-de-servicos', redirectTo: 'ordens-servico', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
