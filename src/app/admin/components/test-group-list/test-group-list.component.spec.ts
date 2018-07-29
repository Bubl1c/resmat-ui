import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestGroupTreeComponent } from './test-group-tree.component';

describe('TestGroupTreeComponent', () => {
  let component: TestGroupTreeComponent;
  let fixture: ComponentFixture<TestGroupTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestGroupTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestGroupTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
