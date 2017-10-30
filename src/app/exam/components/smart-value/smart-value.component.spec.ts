import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartValueComponent } from './smart-value.component';

describe('SmartValueComponent', () => {
  let component: SmartValueComponent;
  let fixture: ComponentFixture<SmartValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
