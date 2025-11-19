import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVender } from './modal-vender';

describe('ModalVender', () => {
  let component: ModalVender;
  let fixture: ComponentFixture<ModalVender>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalVender]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalVender);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
