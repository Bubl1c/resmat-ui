import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { ChartsModule } from "ng2-charts/ng2-charts";
import {PrettyJsonModule} from 'angular2-prettyjson';
import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import { FileUploadModule } from 'ng2-file-upload';

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { ExamComponent } from "./exam/exam.component";
import { TaskComponent } from "./exam/components/task/task.component";
import { TestComponent } from "./exam/components/test/test.component";
import { EChartComponent } from "./exam/components/e-chart/e-chart.component";
import { ChartSetComponent } from "./exam/components/chart-set/chart-set.component";
import { StatusComponent } from "./exam/components/status/status.component";
import { StatusWithNavigationComponent } from "./exam/components/status-with-navigation/status-with-navigation.component";
import { NavigationComponent } from "./exam/components/navigation/navigation.component";
import { TestSetComponent } from "./exam/components/test-set/test-set.component";
import { HelpMaterialsComponent } from "./components/help-materials/help-materials.component";
import { TaskFlowComponent } from "./exam/components/task-flow/task-flow.component";
import { BorderStickyBtnComponent } from "./components/border-sticky-btn/border-sticky-btn.component";
import { InputSetComponent } from "./exam/components/input-set/input-set.component";
import { ExamResultsComponent } from "./exam/components/exam-results/exam-results.component";
import { Ng2PageScrollModule } from "ng2-page-scroll";
import { ApiService } from "./api.service";
import { AdminComponent } from "./admin/admin.component";
import { UserComponent } from "./admin/components/user/user.component";
import { GroupStudentsComponent } from "./admin/components/group-students/group-students.component";
import { MyExamsComponent } from './exam/components/my-exams/my-exams.component';
import { MathJaxComponent } from './components/math-jax/math-jax.component';
import { ExamConfComponent } from './admin/components/exam-conf/exam-conf.component';
import { ProblemConfComponent } from './admin/components/problem-conf/problem-conf.component';
import { CustomModal } from './admin/components/custom-modal/custom-modal.component';
import { CreateStudentComponent } from './admin/components/create-student/create-student.component';
import { StudentExamsComponent } from './admin/components/student-exams/student-exams.component';
import { UploadComponent } from './components/upload/upload.component';
import { TestConfPreviewComponent } from './admin/components/test-conf-preview/test-conf-preview.component';
import { EditTestConfComponent } from './admin/components/edit-test-conf/edit-test-conf.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { TextareaAutosizeDirective } from './components/textarea-autosize.directive';
import { EditableTextComponent } from './components/editable-text/editable-text.component';
import { TextEditorComponent } from './components/text-editor/text-editor.component';
import { SafeInnerHtmlPipe } from './components/safe-inner-html/safe-inner-html.pipe';
import { ArticleEditorComponent } from "./admin/components/article-editor/article-editor.component";
import { ArticleComponent } from './admin/components/article/article.component';
import { ArticlePreviewComponent } from './admin/components/article-preview/article-preview.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ExamComponent,
    TestComponent,
    EChartComponent,
    ChartSetComponent,
    TaskComponent,
    StatusComponent,
    StatusWithNavigationComponent,
    NavigationComponent,
    TestSetComponent,
    HelpMaterialsComponent,
    TaskFlowComponent,
    BorderStickyBtnComponent,
    InputSetComponent,
    ExamResultsComponent,
    AdminComponent,
    UserComponent,
    GroupStudentsComponent,
    MyExamsComponent,
    MathJaxComponent,
    ExamConfComponent,
    ProblemConfComponent,
    CustomModal,
    CreateStudentComponent,
    StudentExamsComponent,
    UploadComponent,
    TestConfPreviewComponent,
    EditTestConfComponent,
    DropdownComponent,
    TextareaAutosizeDirective,
    EditableTextComponent,
    TextEditorComponent,
    ArticleEditorComponent,
    SafeInnerHtmlPipe,
    ArticleComponent,
    ArticlePreviewComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ChartsModule,
    Ng2PageScrollModule.forRoot(),
    PrettyJsonModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    FileUploadModule
  ],
  providers: [ApiService],
  bootstrap: [AppComponent],
  entryComponents: [ CustomModal ]
})
export class AppModule {
}
