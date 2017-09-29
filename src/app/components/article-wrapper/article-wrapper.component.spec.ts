import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleWrapperComponent } from './article-wrapper.component';

describe('ArticleWrapperComponent', () => {
  let component: ArticleWrapperComponent;
  let fixture: ComponentFixture<ArticleWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
