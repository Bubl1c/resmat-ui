import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, Inject } from '@angular/core';
import { ITestData } from "../../data/exam.api-protocol";
import { ExamService, VerifiedTestAnswer } from "../../data/exam-service.service";
import { IExamTaskFlowStepData, TaskFlowStepTypes } from "../../data/task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "../../data/i-exam-task-flow-task-data";
import { InputSetData, InputSetAnswer, InputSetStatus } from "../input-set/input-set.component";
import { TestAnswer, Test, TestStatus } from "../test/test.component";
import { ExamResult } from "../exam-results/exam-results.component";
import { ChartSet } from "../chart-set/chart-set.component";
import { PageScrollService, PageScrollInstance } from "ng2-page-scroll";
import { DOCUMENT } from "@angular/platform-browser";

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

class HelpDataItem {
  constructor(public type: string, public data: any) {}
}

class InputSetTaskFlowStep extends TaskFlowStep {
  data: InputSetData;
  constructor(taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData, public examService: ExamService) {
    super(taskData, stepData);
  }

  onSubmitted(submittedData: InputSetAnswer): void {
    console.log("Verify input set answer: ", submittedData);
    let that = this;
    this.examService.verifyTaskFlowStep(this.taskData.examId, this.taskData.id, this.sequence, submittedData)
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
    this.data = new InputSetData(typedData.id, this.sequence, this.name, typedData.variables);
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
    this.examService.verifyTaskFlowStep(this.taskData.examId, this.taskData.id, this.sequence, submittedData)
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

class ChartSetTaskFlowStep extends TaskFlowStep {
  data: ChartSet;
  constructor(taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData, public examService: ExamService) {
    super(taskData, stepData);
  }

  onSubmitted(submittedData: any): void {}

  fillData(data: any): void {
    this.data = new ChartSet("", data); //empty title, it is displayed separately
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

class LoadingTaskFlowStep extends TaskFlowStep {
  fillData(data: any): void {}
  onSubmitted(submittedData: any): void {}
  constructor() { super(null, <IExamTaskFlowStepData> { type: TaskFlowStepTypes.Loading }); }
}

@Component({
  selector: 'task-flow',
  templateUrl: './task-flow.component.html',
  styleUrls: ['./task-flow.component.css'],
  providers: [ExamService]
})
export class TaskFlowComponent implements OnInit {
  @Input() task: IExamTaskFlowTaskData;

  @ViewChild('taskFlowContainer') private taskFlowContainer: ElementRef;

  step: TaskFlowStep = new LoadingTaskFlowStep();
  helpDataItems: HelpDataItem[] = [];

  @Output() onFinished = new EventEmitter<any>();

  constructor(private examService: ExamService, private pageScrollService: PageScrollService, @Inject(DOCUMENT) private document: Document) {
  }

  ngOnInit() {
    this.loadStep(this.task.currentStep);
  }

  stepSubmitted(submittedData: any) {
    this.step.onSubmitted(submittedData);
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

  private scrollToBottom(): void {
    let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, '#scrollToBottomAnchor');
    this.pageScrollService.start(pageScrollInstance);
  }

  private loadStep(sequence: number) {
    this.step = new LoadingTaskFlowStep();
    this.examService.getExamTaskFlowStep(this.task.examId, this.task.id, sequence).subscribe((step: IExamTaskFlowStepData) => {
      console.log("Task flow step " + sequence + " loaded: ", step);
      if(step.helpData) {
        this.helpDataItems.push(new HelpDataItem(step.type, step.data));
        this.loadStep(step.sequence + 1);
        return;
      } else {
        this.step = this.createStep(step);
      }
      this.scrollToBottom()
    });
  }

  private createStep(stepData: IExamTaskFlowStepData): TaskFlowStep {
    switch(stepData.type) {
      case TaskFlowStepTypes.Test:
        return new TestTaskFlowStep(this.task, stepData, this.examService);
      case TaskFlowStepTypes.InputSet:
        return new InputSetTaskFlowStep(this.task, stepData, this.examService);
      case TaskFlowStepTypes.Charts:
        return new ChartSetTaskFlowStep(this.task, stepData, this.examService);
      case TaskFlowStepTypes.Finished:
        this.finish();
        break;
      default: throw "Invalid task flow step types received: '" + stepData.type + "'";
    }
  }

}
