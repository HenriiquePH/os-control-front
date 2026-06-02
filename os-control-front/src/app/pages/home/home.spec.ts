import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Home } from './home';
import { AuthService } from '../../services/auth.service';
import { ClientesService } from '../../services/clientes.service';
import { OrdensServicoService } from '../../services/ordens-servico.service';
import { OrcamentosService } from '../../services/orcamentos.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: AuthService,
          useValue: {
            obterUsuario: () => 'Teste',
            sair: jasmine.createSpy('sair'),
          },
        },
        {
          provide: OrdensServicoService,
          useValue: {
            listar: () => of([]),
          },
        },
        {
          provide: OrcamentosService,
          useValue: {
            listar: () => of([]),
          },
        },
        {
          provide: ClientesService,
          useValue: {
            listar: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
