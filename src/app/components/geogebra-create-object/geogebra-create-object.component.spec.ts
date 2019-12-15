import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeogebraCreateObjectComponent } from './geogebra-create-object.component';

describe('GeogebraCreateObjectComponent', () => {
  let component: GeogebraCreateObjectComponent;
  let fixture: ComponentFixture<GeogebraCreateObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeogebraCreateObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeogebraCreateObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
