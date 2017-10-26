import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RgbInputComponent } from './rgb-input.component';

describe('RgbInputComponent', () => {
  let component: RgbInputComponent;
  let fixture: ComponentFixture<RgbInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RgbInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RgbInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
