/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChartSetComponent } from './chart-set.component';

describe('ChartSetComponent', () => {
  let component: ChartSetComponent;
  let fixture: ComponentFixture<ChartSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
