import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ITestData } from "../../data/exam.api-protocol";
import { ExamService, VerifiedTestAnswer } from "../../data/exam-service.service";
import { IExamTaskFlowStepData, TaskFlowStepTypes } from "../../data/task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "../../data/i-exam-task-flow-task-data";
import { InputSetData, InputSetAnswer, InputSetStatus } from "../input-set/input-set.component";
import { TestAnswer, Test, TestStatus } from "../test/test.component";
import { ExamResult } from "../exam-results/exam-results.component";

abstract class TaskFlowStep {
  id: number;
  type: string;
  sequence: number;
  name: string;
  data: any;
  constructor(public taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData) {
    this.id = stepData.id;
    this.type = stepData.type;
    this.sequence = stepData.sequence;
    this.name = stepData.name;
    this.fillData(stepData.data); //should be the last expression to allow to use other fields inside
  }
  abstract onSubmitted(submittedData: any): void
  abstract fillData(data: any): void
}

class InputSetTaskFlowStep extends TaskFlowStep {
  data: InputSetData;
  constructor(taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData, public examService: ExamService) {
    super(taskData, stepData);
  }

  onSubmitted(submittedData: InputSetAnswer): void {
    console.log("Verify input set answer: ", submittedData);
    let that = this;
    this.examService.verifyExamTaskFlowInputSet(this.taskData.examId, this.taskData.id, this.sequence, submittedData)
      .subscribe((verified: InputSetAnswer) => {
        that.data.variables.forEach(v => {
          let verifiedVar = verified.find(v.id);
          v.correct = verifiedVar == null ? false : verifiedVar.correct
        });
        that.data.status = verified.allCorrect ? InputSetStatus.Correct : InputSetStatus.Incorrect
      })
  }

  fillData(data: any): void {
    let typedData = <InputSetData> data;
    this.data = typedData;
    this.data.sequence = this.sequence;
  }
}

class TestTaskFlowStep extends TaskFlowStep {
  data: Test;
  constructor(taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData, public examService: ExamService) {
    super(taskData, stepData);
  }

  onSubmitted(submittedData: TestAnswer): void {
    console.log("Verify test answer: ", submittedData);
    let that = this;
    this.examService.verifyExamTaskFlowTest(this.taskData.examId, this.taskData.id, this.sequence, submittedData)
      .subscribe({
        next: (verifiedAnswer: VerifiedTestAnswer) => {
          console.log("Verified test answer: ", verifiedAnswer);
          that.data.status = verifiedAnswer.isAllCorrect ? TestStatus.Correct : TestStatus.Incorrect;
          console.log("Test status: ", that.data.status);
          that.data.options.forEach(testOption => {
            //If an option was submitted and exists in the verified answer
            verifiedAnswer.callIfExists(testOption.id, isCorrect => {
              //Set the correctness of the option
              testOption.correct = isCorrect;
            })
          });
        },
        error: error => console.log(error)
      })
  }

  fillData(data: any): void {
    let typedData = <ITestData> data;
    this.data = new Test(typedData, this.sequence);
    this.data.sequence = this.sequence;
  }
}

class SummaryTaskFlowStep extends TaskFlowStep {
  data: ExamResult;
  constructor(taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData, public examService: ExamService) {
    super(taskData, stepData);
  }

  onSubmitted(submittedData: any): void {}

  fillData(data: any): void {
    let typedData = <ExamResult> data;
    this.data = typedData;
  }
}

class InitialTaskFlowStep extends TaskFlowStep {
  fillData(data: any): void {}
  onSubmitted(submittedData: any): void {}
  constructor() {
    super(null, <IExamTaskFlowStepData> {})
  }
}

@Component({
  selector: 'task-flow',
  templateUrl: './task-flow.component.html',
  styleUrls: ['./task-flow.component.css'],
  providers: [ExamService]
})
export class TaskFlowComponent implements OnInit {
  @Input()
  task: IExamTaskFlowTaskData;
  step: TaskFlowStep;
  isLoading = true;

  @Output() onFinished: EventEmitter<any>;

  constructor(private examService: ExamService) {
    this.step = new InitialTaskFlowStep();
    this.onFinished = new EventEmitter();
  }

  ngOnInit() {
    this.loadStep(this.task.currentStep);
  }

  stepSubmitted(submittedData: any) {
    this.step.onSubmitted(submittedData)
  }

  stepContinue() {
    this.loadStep(this.step.sequence + 1);
  }

  stepBack() {
    this.loadStep(this.step.sequence - 1);
  }

  finish() {
    this.onFinished.emit();
  }

  private loadStep(sequence: number) {
    this.examService.getExamTaskFlowStep(this.task.examId, this.task.id, sequence).subscribe((step: IExamTaskFlowStepData) => {
      console.log("Task flow step " + sequence + " loaded: ", step);
      this.step = this.createStep(step);
      this.isLoading = false;
    });
  }

  private createStep(stepData: IExamTaskFlowStepData): TaskFlowStep {
    switch(stepData.type) {
      case TaskFlowStepTypes.Test:
        return new TestTaskFlowStep(this.task, stepData, this.examService);
      case TaskFlowStepTypes.InputSet:
        return new InputSetTaskFlowStep(this.task, stepData, this.examService);
      case TaskFlowStepTypes.Charts:
        break;
      case TaskFlowStepTypes.Finished:
        this.finish();
        break;
      default: throw "Invalid task flow step types received: '" + stepData.type + "'";
    }
  }

}
