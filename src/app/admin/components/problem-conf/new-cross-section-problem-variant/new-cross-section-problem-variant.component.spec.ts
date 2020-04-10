import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCrossSectionProblemVariantComponent } from './new-cross-section-problem-variant.component';

describe('NewCrossSectionProblemVariantComponent', () => {
  let component: NewCrossSectionProblemVariantComponent;
  let fixture: ComponentFixture<NewCrossSectionProblemVariantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCrossSectionProblemVariantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCrossSectionProblemVariantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
