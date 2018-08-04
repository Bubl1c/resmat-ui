import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditExamStepConfComponent } from './edit-exam-step-conf.component';

describe('EditExamStepConfComponent', () => {
  let component: EditExamStepConfComponent;
  let fixture: ComponentFixture<EditExamStepConfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditExamStepConfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditExamStepConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
