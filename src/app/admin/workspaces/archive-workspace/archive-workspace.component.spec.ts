import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveWorkspaceComponent } from './archive-workspace.component';

describe('ArchiveWorkspaceComponent', () => {
  let component: ArchiveWorkspaceComponent;
  let fixture: ComponentFixture<ArchiveWorkspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchiveWorkspaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
