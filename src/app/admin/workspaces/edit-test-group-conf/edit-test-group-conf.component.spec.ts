import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTestGroupConfComponent } from './edit-test-group-conf.component';

describe('EditTestGroupConfComponent', () => {
  let component: EditTestGroupConfComponent;
  let fixture: ComponentFixture<EditTestGroupConfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTestGroupConfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTestGroupConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
