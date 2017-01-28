import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { InMemoryWebApiModule } from "angular-in-memory-web-api";
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ExamComponent } from './exam/exam.component';
import { ExamSeedData } from "./exam/data/mock/exam.data-service";
import { TaskComponent } from './exam/components/task/task.component';
import { TestComponent } from "./exam/components/test/test.component";
import { EChartComponent } from "./exam/components/e-chart/e-chart.component";
import { ChartSetComponent } from "./exam/components/chart-set/chart-set.component";
import { StatusComponent } from './exam/components/status/status.component';
import { StatusWithNavigationComponent } from './exam/components/status-with-navigation/status-with-navigation.component';
import { NavigationComponent } from './exam/components/navigation/navigation.component';
import { TestSetComponent } from './exam/components/test-set/test-set.component';
import { HelpMaterialsComponent } from './components/help-materials/help-materials.component';
import { TaskFlowComponent } from './exam/components/task-flow/task-flow.component';
import { BorderStickyBtnComponent } from './components/border-sticky-btn/border-sticky-btn.component';
import { InputSetComponent } from './exam/components/input-set/input-set.component';
import { ExamResultsComponent } from './exam/components/exam-results/exam-results.component';
import { Ng2PageScrollModule } from "ng2-page-scroll";
import { ApiService } from "./api.service";
import { AdminComponent } from './admin/admin.component';

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
    AdminComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    InMemoryWebApiModule.forRoot(ExamSeedData, { passThruUnknownUrl: true, apiBase: "api/", delay: 500 }),
    ChartsModule,
    Ng2PageScrollModule.forRoot()
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
