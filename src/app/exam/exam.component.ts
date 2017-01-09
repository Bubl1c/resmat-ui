import { Component, OnInit } from '@angular/core';
import { ExamService } from "./exam-service.service";
import { MathSymbolConverter } from "app/utils/MathSymbolConverter";
import { TestSubmit, Test, TestStatus } from "./components/test/test.component";
import { ISchemaVar, ITest } from "./exam.model";
import { hardcoded_testCorrectOptions } from "./exam.hardcoded.data";

class TestSetAssignment {
  data: Test[] = [];
  mistakes: number = 0;
  mistakesLimit: number = 5;
  maxAttempts: number = 3;

  constructor(private examService: ExamService) {
  }

  loadInitialData() {
    this.examService.getTests().subscribe(response => {
      this.data = this.mapITests(response);
    })
  }

  verify(submitted: TestSubmit) {
    console.log('Verifying submitted test: ', submitted);
    let correctOption = hardcoded_testCorrectOptions.find(tco => tco.id === submitted.id);
    let correctAnswer = false;
    if(correctOption) {
      correctAnswer = correctOption.correct === submitted.checked.id
    }
    let test = this.data.find(t => t.id == submitted.id);
    if(!test) {
      console.error("Submitted test is not found: " + submitted);
    }
    let that = this;
    setTimeout(
      function() {
        if(!correctAnswer) that.mistakes++;
        test.status = correctAnswer ? TestStatus.Correct : TestStatus.Wrong;
      }, 500)
  }

  private mapITests(iTests: ITest[]): Test[] {
    return iTests.map((t, i) => new Test(t, i + 1))
  }
}

class TaskFlowAssignment {
  constructor() {
  }
}

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.css'],
  providers: [ExamService]
})
export class ExamComponent implements OnInit {
  testSet: TestSetAssignment;

  constructor(private examService: ExamService) {
    this.testSet = new TestSetAssignment(examService);
  }

  // loadExam(code: string) {
  //   this.examService.getExams().subscribe(
  //     (exams: IExam[]) => {
  //       console.log('Exams are loaded: ', exams);
  //       let loadedExam = exams[0];
  //       if(loadedExam) {
  //         loadedExam.schemaVars = loadedExam.schemaVars.map(schemaVar => this.convertSymbols(schemaVar))
  //       }
  //       this.exam = loadedExam;
  //     },
  //     error =>  this.errorMessage = <any>error);
  // }

  private convertSymbols(schemaVar: ISchemaVar): ISchemaVar {
    schemaVar.name = MathSymbolConverter.convertString(schemaVar.name);
    return schemaVar;
  }

  ngOnInit() {
    // this.loadExam('eef')
    this.testSet.loadInitialData();
  }

  nextAssignment(event: any) {
    console.log('Going to next assignment: ', event);
  }

  continue() {
    console.log("Go gogo")
  }

}
