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
import { ExamSeedData } from "./exam/exam.data";
import { TestComponent } from './test/test.component';
import { FlowComponent } from './flow/flow.component';
import { BcComponent } from './flow/bc/bc.component';
import { SubmitComponent } from './flow/submit/submit.component';
import { EChartComponent } from './e-chart/e-chart.component';
import { ChartSetComponent } from './flow/chart-set/chart-set.component';
import { XResultsComponent } from './flow/x-results/x-results.component';
import { CutComponent } from './flow/cut/cut.component';
import { StrengthComponent } from './flow/strength/strength.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ExamComponent,
    TestComponent,
    FlowComponent,
    BcComponent,
    SubmitComponent,
    EChartComponent,
    ChartSetComponent,
    XResultsComponent,
    CutComponent,
    StrengthComponent
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
