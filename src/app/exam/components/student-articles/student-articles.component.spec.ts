import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentArticlesComponent } from './student-articles.component';

describe('StudentArticlesComponent', () => {
  let component: StudentArticlesComponent;
  let fixture: ComponentFixture<StudentArticlesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentArticlesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
