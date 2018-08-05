import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamConfStepsTabsComponent } from './exam-conf-steps-tabs.component';

describe('ExamConfStepsTabsComponent', () => {
  let component: ExamConfStepsTabsComponent;
  let fixture: ComponentFixture<ExamConfStepsTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExamConfStepsTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamConfStepsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
