/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EChartComponent } from './e-chart.component';

describe('EChartComponent', () => {
  let component: EChartComponent;
  let fixture: ComponentFixture<EChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
