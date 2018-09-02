import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTaskFlowConfComponent } from './edit-task-flow-conf.component';

describe('EditTaskFlowConfComponent', () => {
  let component: EditTaskFlowConfComponent;
  let fixture: ComponentFixture<EditTaskFlowConfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTaskFlowConfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTaskFlowConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
