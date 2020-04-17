import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Docx4jsTestComponent } from './docx4js-test.component';

describe('Docx4jsTestComponent', () => {
  let component: Docx4jsTestComponent;
  let fixture: ComponentFixture<Docx4jsTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Docx4jsTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Docx4jsTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
