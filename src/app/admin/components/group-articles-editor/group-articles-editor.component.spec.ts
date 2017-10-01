import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupArticlesEditorComponent } from './group-articles-editor.component';

describe('GroupArticlesEditorComponent', () => {
  let component: GroupArticlesEditorComponent;
  let fixture: ComponentFixture<GroupArticlesEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupArticlesEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupArticlesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
