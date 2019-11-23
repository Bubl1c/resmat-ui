import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DummyForTestingComponent } from './dummy-for-testing.component';

describe('DummyForTestingComponent', () => {
  let component: DummyForTestingComponent;
  let fixture: ComponentFixture<DummyForTestingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DummyForTestingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DummyForTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
