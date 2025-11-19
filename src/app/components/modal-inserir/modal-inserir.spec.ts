import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInserir } from './modal-inserir';

describe('ModalInserir', () => {
  let component: ModalInserir;
  let fixture: ComponentFixture<ModalInserir>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalInserir]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalInserir);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
