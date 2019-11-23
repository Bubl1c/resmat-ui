import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeogebraComponent } from './geogebra.component';

describe('GeogebraComponent', () => {
  let component: GeogebraComponent;
  let fixture: ComponentFixture<GeogebraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeogebraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeogebraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
