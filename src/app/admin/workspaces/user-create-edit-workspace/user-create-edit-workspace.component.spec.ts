import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreateEditWorkspaceComponent } from './user-create-edit-workspace.component';

describe('UserCreateEditWorkspaceComponent', () => {
  let component: UserCreateEditWorkspaceComponent;
  let fixture: ComponentFixture<UserCreateEditWorkspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCreateEditWorkspaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCreateEditWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
