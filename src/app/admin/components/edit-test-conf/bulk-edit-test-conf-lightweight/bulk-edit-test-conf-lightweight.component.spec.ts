import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditTestConfLightweightComponent } from './bulk-edit-test-conf-lightweight.component';

describe('BulkEditTestConfLightweightComponent', () => {
  let component: BulkEditTestConfLightweightComponent;
  let fixture: ComponentFixture<BulkEditTestConfLightweightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkEditTestConfLightweightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditTestConfLightweightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
