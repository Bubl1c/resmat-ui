import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { InMemoryWebApiModule } from "angular-in-memory-web-api";

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ExamComponent } from './exam/exam.component';
import { ExamSeedData } from "./exam/exam.data";
import { TestComponent } from './test/test.component';
import { FlowComponent } from './flow/flow.component';
import { BcComponent } from './flow/bc/bc.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ExamComponent,
    TestComponent,
    FlowComponent,
    BcComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    InMemoryWebApiModule.forRoot(ExamSeedData, { delay: 500 }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
