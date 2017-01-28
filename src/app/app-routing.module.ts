import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from "./login/login.component";
import { ExamComponent } from "./exam/exam.component";
import { AdminComponent } from "./admin/admin.component";

const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // { path: '/exam', component: ExamComponent }
  { path: 'users/:id/exam', component: ExamComponent },
  { path: 'admin', component: AdminComponent }
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
