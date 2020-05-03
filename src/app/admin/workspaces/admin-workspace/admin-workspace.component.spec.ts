import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminWorkspaceComponent } from './admin-workspace.component';

describe('AdminWorkspaceComponent', () => {
  let component: AdminWorkspaceComponent;
  let fixture: ComponentFixture<AdminWorkspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminWorkspaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
