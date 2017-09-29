import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { ExamComponent } from "./exam/exam.component";
import { AdminComponent } from "./admin/admin.component";
import { MyExamsComponent } from "./exam/components/my-exams/my-exams.component";
import {ArticleEditorComponent} from "./admin/components/article-editor/article-editor.component";
import {ArticleListComponent} from "./components/article-list/article-list.component";
import {ArticleWrapperComponent} from "./components/article-wrapper/article-wrapper.component";

const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // { path: '/exam', component: ExamComponent }
  { path: 'users/:id/exams', component: MyExamsComponent },
  { path: 'users/:id/exams/:examId', component: ExamComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'blog', component: ArticleEditorComponent },
  { path: 'articles', component: ArticleListComponent },
  { path: 'articles/:articleId', component: ArticleWrapperComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
