/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { XResultsComponent } from './x-results.component';

describe('XResultsComponent', () => {
  let component: XResultsComponent;
  let fixture: ComponentFixture<XResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
