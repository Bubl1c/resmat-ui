import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquationSetComponent } from './equation-set.component';

describe('EquationSetComponent', () => {
  let component: EquationSetComponent;
  let fixture: ComponentFixture<EquationSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquationSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquationSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
