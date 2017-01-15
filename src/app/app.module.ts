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
// import { FlowComponent } from './flow/flow.component';
import { BcComponent } from './flow/bc/bc.component';
import { XResultsComponent } from './flow/x-results/x-results.component';
import { CutComponent } from './flow/cut/cut.component';
import { StrengthComponent } from './flow/strength/strength.component';
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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ExamComponent,
    TestComponent,
    // FlowComponent,
    BcComponent,
    EChartComponent,
    ChartSetComponent,
    XResultsComponent,
    CutComponent,
    StrengthComponent,
    TaskComponent,
    StatusComponent,
    StatusWithNavigationComponent,
    NavigationComponent,
    TestSetComponent,
    HelpMaterialsComponent,
    TaskFlowComponent,
    BorderStickyBtnComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    InMemoryWebApiModule.forRoot(ExamSeedData, { delay: 500 }),
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
