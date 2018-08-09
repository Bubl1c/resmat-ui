import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTestSetConfComponent } from './edit-test-set-conf.component';

describe('EditTestSetConfComponent', () => {
  let component: EditTestSetConfComponent;
  let fixture: ComponentFixture<EditTestSetConfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTestSetConfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTestSetConfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
