import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { ExamComponent } from "./exam/exam.component";
import { AdminComponent } from "./admin/admin.component";
import { MyExamsComponent } from "./exam/components/my-exams/my-exams.component";
import {TextEditorComponent} from "./components/text-editor/text-editor.component";

const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // { path: '/exam', component: ExamComponent }
  { path: 'users/:id/exams', component: MyExamsComponent },
  { path: 'users/:id/exams/:examId', component: ExamComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'blog', component: TextEditorComponent }
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
