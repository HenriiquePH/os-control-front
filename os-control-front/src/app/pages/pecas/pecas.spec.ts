import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pecas } from './pecas';

describe('Pecas', () => {
  let component: Pecas;
  let fixture: ComponentFixture<Pecas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pecas],
    }).compileComponents();

    fixture = TestBed.createComponent(Pecas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
